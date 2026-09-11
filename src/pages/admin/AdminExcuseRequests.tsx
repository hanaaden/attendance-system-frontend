
import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';
import type { ExcuseRequest } from '../../types';
import Spinner from '../../components/Spinner';
import Banner from '../../components/Banner';
import StatusBadge from '../../components/StatusBadge';

export default function AdminExcuseRequests() {
  const [requests, setRequests] =
    useState<ExcuseRequest[]>([]);

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [commentMap, setCommentMap] =
    useState<Record<string, string>>({});


  async function load() {
    setLoading(true);

    try {
      const result =
        await apiGet<{
          excuseRequests: ExcuseRequest[];
        }>('excuseRequests');


      setRequests(
        result.excuseRequests ?? []
      );

      setError(null);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Could not load excuse requests.'
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    load();
  }, []);


  const filteredRequests =
    useMemo(() => {

      return requests.filter(
        (request) =>
          request.status === 'PENDING' ||
          request.status === 'APPROVED' ||
          request.status === 'REJECTED'
      );

    }, [requests]);


  async function handleDecision(
    request: ExcuseRequest,
    action: 'APPROVE' | 'REJECT'
  ) {

    if (request.status !== 'PENDING') {
      return;
    }


    setProcessingId(
      request.requestId
    );

    setError(null);


    try {

      const payload = {
        requestId:
          request.requestId,

        adminComment:
          commentMap[request.requestId] ||
          request.adminComment ||
          ''
      };


      if (action === 'APPROVE') {

        await apiPost(
          'approveExcuseRequest',
          payload
        );

      } else {

        await apiPost(
          'rejectExcuseRequest',
          payload
        );

      }


      await load();


      /*
       * Remove the comment after
       * successful processing.
       */
      setCommentMap(
        (previous) => {

          const next = {
            ...previous
          };

          delete next[request.requestId];

          return next;

        }
      );


    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Could not process excuse request.'
      );

    } finally {

      setProcessingId(null);

    }
  }


  return (
    <div>

      <header className="mb-8">

        <h1 className="font-serif text-2xl text-ink">
          Excuse Requests
        </h1>

        <p className="text-sm text-ink/60">
          Review student excuse requests and approve or reject them.
        </p>

      </header>


      {error && (
        <div className="mb-4">
          <Banner kind="error">
            {error}
          </Banner>
        </div>
      )}


      {loading ? (

        <Spinner label="Loading excuse requests…" />

      ) : (

        <div className="card overflow-x-auto">

          <table className="ledger w-full">

            <thead>

              <tr>

                <th>Student</th>

                <th>Date</th>

                <th>Course</th>

                <th>Class</th>

                <th>Status</th>

                <th>Reason</th>

                <th>Submitted</th>

                <th>Decision</th>

              </tr>

            </thead>


            <tbody>

              {filteredRequests.map(
                (request) => (

                  <tr
                    key={request.requestId}
                  >

                    {/* Student */}

                    <td>

                      <div>

                        <p className="font-medium text-ink">

                          {request.studentName ||
                            request.studentId}

                        </p>

                        <p className="text-xs text-ink/50">

                          {request.studentId}

                        </p>

                      </div>

                    </td>


                    {/* Date */}

                    <td>

                      {request.date ||
                        request.attendanceDate ||
                        '—'}

                    </td>


                    {/* Course */}

                    <td>

                      <div>

                        <p className="font-medium text-ink">

                          {request.courseName ||
                            request.courseCode ||
                            '—'}

                        </p>

                        {request.courseCode &&
                          request.courseName && (

                          <p className="text-xs text-ink/50">

                            {request.courseCode}

                          </p>

                        )}

                      </div>

                    </td>


                    {/* Class */}

                    <td>

                      {request.className ||
                        '—'}

                    </td>


                    {/* Status */}

                    <td>

                      <StatusBadge
                        value={request.status}
                      />

                    </td>


                    {/* Reason */}

                    <td>

                      <p className="max-w-xs text-sm text-ink">

                        {request.reason || '—'}

                      </p>

                    </td>


                    {/* Submitted */}

                    <td>

                      <span className="text-sm text-ink/70">

                        {request.submittedAt ||
                          '—'}

                      </span>

                    </td>


                    {/* Decision */}

                    <td>

                      {request.status ===
                      'PENDING' ? (

                        <div className="space-y-2">

                          <textarea
                            className="field min-h-[60px]"
                            value={
                              commentMap[
                                request.requestId
                              ] ??
                              request.adminComment ??
                              ''
                            }
                            onChange={(event) =>
                              setCommentMap(
                                (previous) => ({
                                  ...previous,

                                  [request.requestId]:
                                    event.target.value
                                })
                              )
                            }
                            placeholder="Optional admin comment"
                            disabled={
                              processingId ===
                              request.requestId
                            }
                          />


                          <div className="flex gap-2">

                            <button
                              type="button"
                              disabled={
                                processingId ===
                                request.requestId
                              }
                              onClick={() =>
                                handleDecision(
                                  request,
                                  'APPROVE'
                                )
                              }
                              className="btn btn-primary px-2.5 py-1 text-xs"
                            >

                              {processingId ===
                              request.requestId
                                ? 'Processing…'
                                : 'Approve'}

                            </button>


                            <button
                              type="button"
                              disabled={
                                processingId ===
                                request.requestId
                              }
                              onClick={() =>
                                handleDecision(
                                  request,
                                  'REJECT'
                                )
                              }
                              className="btn btn-outline px-2.5 py-1 text-xs"
                            >

                              Reject

                            </button>

                          </div>

                        </div>

                      ) : (

                        <div>

                          <span className="text-sm text-ink/60">

                            {request.adminComment ||
                              'No admin comment'}

                          </span>

                          {request.reviewedAt && (

                            <p className="mt-1 text-xs text-ink/40">

                              Reviewed:{' '}
                              {request.reviewedAt}

                            </p>

                          )}

                        </div>

                      )}

                    </td>

                  </tr>

                )
              )}


              {filteredRequests.length ===
                0 && (

                <tr>

                  <td
                    colSpan={8}
                    className="py-8 text-center text-ink/50"
                  >

                    No excuse requests found.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

