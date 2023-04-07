import GearIcon from '@/components/icons/GearIcon';
import PlusIcon from '@/components/icons/PlusIcon';
import { useServerUserProfilePermissions } from '@/lib/store';
import { ServerPermissions } from '@/types/permissions';
import { useUser } from '@supabase/auth-helpers-react';
import { Tooltip } from 'react-tooltip';

export function ServerSettingsTooltip({ server_id, setShowAddChannelModal, setShowServerSettingsModal }: {
  server_id: number,
  setShowAddChannelModal: (value: boolean) => void,
  setShowServerSettingsModal: (value: boolean) => void }
) {
  const user = useUser();
  const serverPermissions = useServerUserProfilePermissions(server_id, user?.id!);

  if (serverPermissions & ServerPermissions.MANAGE_MESSAGES ||
    serverPermissions & ServerPermissions.OWNER ||
    serverPermissions & ServerPermissions.MANAGE_SERVER) {
    return (
      <Tooltip
        className="z-20 !opacity-100 font-semibold "
        style={{
          backgroundColor: '#21282b',
          borderRadius: '0.5rem',
          fontSize: '1.125rem',
          lineHeight: '1.75rem',
        }}
        id="serverSettings"
        clickable
        openOnClick={true}
        place='top'
      >
        <div className="flex flex-col items-start">
          <div
            className="flex justify-center items-center hover:text-grey-300 cursor-pointer"
            onClick={() => {
              setShowAddChannelModal(true);
            }}
          >
            <PlusIcon width={5} height={5} />
            <span className="ml-1">New channel</span>
          </div>
          {serverPermissions & ServerPermissions.MANAGE_SERVER ? (
            <div
              className="flex justify-center items-center hover:text-grey-300 cursor-pointer"
              onClick={() => {
                setShowServerSettingsModal(true);
              }}
            >
              <GearIcon width={5} height={5} />
              <span className="ml-1">Server Settings</span>
            </div>
          ) : (
            ''
          )}
        </div>
      </Tooltip>
    );
  }

  return <></>;
}
