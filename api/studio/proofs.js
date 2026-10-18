import crypto from 'node:crypto';
import { getSupabaseAdmin } from '../_utils/supabase-admin.js';
import { verifyStudioAccess } from '../_utils/tenant.js';
import { sendJson, parseJsonBody } from '../_utils/auth.js';
import { logAuditEvent } from '../_utils/audit.js';

/**
 * Computes a deterministic SHA-256 digital signature digest for packaging sign-off
 */
function generateDigitalSignature({ skuId, revisionNumber, status, decisionBy, timestamp }) {
  const payload = `${skuId}|REV_${revisionNumber}|${status.toUpperCase()}|${(decisionBy || '').trim().toLowerCase()}|${timestamp}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Studio OS — Proof Approval & Sign-Off API Handler
 */
export default async function handler(req, res) {
  const method = req.method;
  const url = new URL(req.url, 'http://localhost');
  const querySkuId = req.query?.sku_id || url.searchParams.get('sku_id');
  const queryClientId = req.query?.client_id || url.searchParams.get('client_id');

  // 1. Enforce Authentication
  const auth = await verifyStudioAccess(req, null);
  if (auth.error) {
    return sendJson(res, auth.status || 401, { error: auth.error });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    switch (method) {
      // ---------------------------------------------------------
      // GET: Retrieve proof approvals history
      // ---------------------------------------------------------
      case 'GET': {
        if (!querySkuId && !queryClientId) {
          return sendJson(res, 400, { error: 'sku_id or client_id is required to fetch proof approvals.' });
        }

        let query = supabaseAdmin
          .from('proof_approvals')
          .select('*')
          .order('created_at', { ascending: false });

        if (querySkuId) {
          query = query.eq('sku_id', querySkuId);
        } else if (queryClientId) {
          // Verify tenant isolation
          if (!auth.isAdmin && auth.clientId !== queryClientId) {
            return sendJson(res, 403, { error: 'Forbidden: Access to this client proof log is denied.' });
          }
          query = query.eq('client_id', queryClientId);
        }

        const { data: proofs, error } = await query;
        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        return sendJson(res, 200, { proof_approvals: proofs || [] });
      }

      // ---------------------------------------------------------
      // POST: Submit a digital sign-off or change request
      // ---------------------------------------------------------
      case 'POST': {
        const body = await parseJsonBody(req);
        const {
          sku_id,
          status,
          decision_by,
          decision_role = 'Client Brand Stakeholder',
          decision_notes = '',
          dieline_confirmed = false,
          artwork_confirmed = false
        } = body;

        if (!sku_id) {
          return sendJson(res, 400, { error: 'sku_id is required.' });
        }

        const validStatuses = ['approved', 'changes_requested', 'rejected', 'pending'];
        if (!status || !validStatuses.includes(status)) {
          return sendJson(res, 400, {
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`
          });
        }

        const approverName = (decision_by || auth.user?.email || '').trim();
        if (!approverName) {
          return sendJson(res, 400, { error: 'decision_by (approver name or email) is required.' });
        }

        if (status === 'approved' && (!dieline_confirmed || !artwork_confirmed)) {
          return sendJson(res, 400, {
            error: 'Legal confirmation required: Both dieline dimensions and artwork vectors must be certified before approval.'
          });
        }

        // Fetch SKU to verify existence and tenant isolation
        const { data: sku, error: skuErr } = await supabaseAdmin
          .from('skus')
          .select('id, client_id, name, sku_code, current_revision, status')
          .eq('id', sku_id)
          .single();

        if (skuErr || !sku) {
          return sendJson(res, 404, { error: 'Packaging SKU not found.' });
        }

        // Verify tenant permissions
        if (!auth.isAdmin && auth.clientId !== sku.client_id) {
          return sendJson(res, 403, { error: 'Forbidden: Access to this SKU proof is denied.' });
        }

        const revisionNumber = sku.current_revision || 1;
        const nowIso = new Date().toISOString();
        const signatureHash = generateDigitalSignature({
          skuId: sku.id,
          revisionNumber,
          status,
          decisionBy: approverName,
          timestamp: nowIso
        });

        const proofRecord = {
          sku_id: sku.id,
          client_id: sku.client_id,
          revision_number: revisionNumber,
          status,
          decision_by: approverName,
          decision_role: decision_role.trim(),
          decision_notes: decision_notes.trim(),
          signature_hash: signatureHash,
          metadata: {
            dieline_confirmed: Boolean(dieline_confirmed),
            artwork_confirmed: Boolean(artwork_confirmed),
            timestamp: nowIso,
            user_id: auth.user?.id || null,
            user_email: auth.user?.email || approverName
          }
        };

        const { data: savedProof, error: proofInsertErr } = await supabaseAdmin
          .from('proof_approvals')
          .insert(proofRecord)
          .select()
          .single();

        if (proofInsertErr) {
          throw new Error(`Failed to record proof approval: ${proofInsertErr.message}`);
        }

        // Update SKU lifecycle status based on decision
        let targetSkuStatus = sku.status;
        if (status === 'approved') {
          targetSkuStatus = 'approved';
        } else if (status === 'changes_requested') {
          targetSkuStatus = 'in_design';
        }

        if (targetSkuStatus !== sku.status) {
          await supabaseAdmin
            .from('skus')
            .update({ status: targetSkuStatus, updated_at: nowIso })
            .eq('id', sku.id);
        }

        // Audit Trail Logging
        await logAuditEvent({
          clientId: sku.client_id,
          actor: auth.user,
          action: status === 'approved' ? 'PROOF_APPROVED' : status === 'changes_requested' ? 'PROOF_CHANGES_REQUESTED' : 'PROOF_DECISION_RECORDED',
          resourceType: 'proof_approval',
          resourceId: savedProof?.id || sku.id,
          details: {
            sku_id: sku.id,
            sku_code: sku.sku_code,
            revision_number: revisionNumber,
            status,
            decision_by: approverName,
            signature_hash: signatureHash
          }
        });

        return sendJson(res, 201, {
          proof: savedProof,
          signature_hash: signatureHash,
          sku: {
            id: sku.id,
            name: sku.name,
            sku_code: sku.sku_code,
            revision_number: revisionNumber,
            status: targetSkuStatus
          }
        });
      }

      default:
        res.setHeader('Allow', 'GET, POST');
        return sendJson(res, 405, { error: `Method ${method} not allowed.` });
    }
  } catch (err) {
    console.error('Proof Approvals API error:', err);
    return sendJson(res, 500, { error: `Proof Approvals API error: ${err.message}` });
  }
}

export { generateDigitalSignature };
