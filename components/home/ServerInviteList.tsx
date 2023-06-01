import { CopyLinkIcon } from '@/components/icons/CopyLinkIcon';
import TrashIcon from '@/components/icons/TrashIcon';
import { formatDateStr } from '@/lib/dateManagement';
import { deleteInvite, getInvitesForServer } from '@/services/invites.service';
import { Invite, Server } from '@/types/dbtypes';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { supabase } from '@supabase/auth-ui-react/dist/esm/common/theming';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export function ServerInviteList({ server }: { server: Server }) {
  const supabase = createClientComponentClient();
  const [serverInvites, setServerInvites] = useState<Invite[]>([]);

  useEffect(() => {
    async function handleAsync() {
      const { data, error } = await getInvitesForServer(supabase, server.id);

      if (error) {
        console.error(error);
        return;
      }

      setServerInvites(data);
    }

    handleAsync();
  }, [server, supabase]);

  return (
    <table className="text-center font-light">
      <thead>
        <tr className="text-lg">
          <th className="font-light">Invite Code</th>
          <th className="font-light">Created</th>
          <th className="font-light">Expires</th>
          <th className="font-light">Uses Remaining</th>
          <th className="font-light">Actions</th>
        </tr>
      </thead>
      <tbody>
        {serverInvites.map((invite) => (
          <tr
            key={invite.id}
            className="border-b border-gray-600 space-y-2 p-2"
          >
            <td>
              <code className="p-1 bg-slate-800 rounded-md text-sm">
                {invite.url_id}
              </code>
            </td>
            <td>{formatDateStr(invite.created_at!)}</td>
            <td>
              {!!invite.expires_at
                ? formatDateStr(invite.expires_at!)
                : 'Never'}
            </td>
            <td>{invite.uses_remaining}</td>
            <td className="flex flex-row space-x-2">
              <button
                className="p-1 hover:bg-slate-600 transition-colors rounded-md"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${location.origin}/invite/${invite.url_id}`
                  );
                }}
              >
                <CopyLinkIcon className="w-5 h-5" />
              </button>
              <button
                className="p-1 hover:bg-slate-600 transition-colors rounded-md"
                onClick={async () => {
                  const { error } = await deleteInvite(supabase, invite.id);

                  if (error) {
                    console.error(error);
                    toast.error('Failed to delete invite');
                    return;
                  }

                  setServerInvites((invites) =>
                    invites.filter((i) => i.id !== invite.id)
                  );
                  toast.success('Invite deleted');
                }}
              >
                <TrashIcon styles="stroke-red-500" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
