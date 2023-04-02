import {
  useChannel,
  useCurrentRoomRef,
  useSetConnectionState,
  useSetCurrentRoomId,
  useSetCurrentRoomName,
  useUserRef,
} from '@/lib/store';
import styles from '@/styles/Chat.module.css';
import mediaStyle from '@/styles/Livekit.module.css';
import { ChannelMediaIcon } from '../icons/ChannelMediaIcon';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useUser } from '@supabase/auth-helpers-react';
import {
  DisconnectButton,
  useConnectionState,
  useToken,
  useTracks,
} from '@livekit/components-react';
import { Track, ConnectionState } from 'livekit-client';
import { Channel, User } from '@/types/dbtypes';
import { FloatingCallControl } from './FloatingCallControl';
import { MediaDispTrack } from './MediaDispTrack';
import { TrackBundle } from '@livekit/components-core';
import Modal from '@/components/home/modals/Modal';
import { useEffect, useRef, useState } from 'react';
import LoadingIcon from '../icons/LoadingIcon';
import { MediaPlaceholderTrack } from './MediaPlaceholderTrack';

export default function MediaChat({
  channel: visibleChannel,
}: {
  channel: Channel;
}) {
  const channel = useChannel();
  const userID: User | any = useUser();
  const user = useUserRef();
  const setConnectionState = useSetConnectionState();
  const connectionState = useConnectionState();
  const setRoomIdRef = useSetCurrentRoomId();
  const setRoomName = useSetCurrentRoomName();
  const currentRoom = useCurrentRoomRef();
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const modalRef = useRef<HTMLDialogElement>(null);

  const token = useToken(
    process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT,
    channel!.channel_id.toString(),
    {
      userInfo: {
        identity: userID.id,
        name: user?.username,
      },
    }
  );

  useEffect(() => {
    if (
      !modalRef.current?.open &&
      currentRoom.channel_id !== channel?.channel_id &&
      connectionState === ConnectionState.Connected
    ) {
      modalRef.current?.showModal();
    }
    // NOTE: We only want this to run when the channel changes. Not when currentRoom or connectionstate changes.
    // Hence why we're not including them in the dependency array.
  }, [channel?.channel_id]);

  return (
    <>
      <Modal
        modalRef={modalRef}
        showModal={false}
        title="Already Connected"
        buttons={
          <div className="flex flex-row w-full h-7">
            <button
              className="w-full"
              onClick={() => {
                modalRef.current?.close();
              }}
            >
              Cancel
            </button>
            <DisconnectButton
              className={
                'w-full bg-red-500 hover:bg-red-700 rounded-lg font-bold text-xl'
              }
              onClick={() => {
                modalRef.current?.close();
                setConnectionState(false);
                setRoomIdRef(0);
                setRoomName(undefined);
              }}
            >
              End
            </DisconnectButton>
          </div>
        }
      >
        <div>
          <p>
            {`Looks like you're already connected to ${currentRoom.name}...`}

            {
              "You'll need to end your current call before you can join another."
            }
          </p>
        </div>
      </Modal>
      <div className={`${styles.chatHeader} px-5 pt-5 mb-3`}>
        <div className="flex items-center">
          <div className="mr-2">
            {channel && channel.is_media ? (
              <ChannelMediaIcon />
            ) : (
              <ChannelMessageIcon size="5" />
            )}
          </div>
          <h1 className="text-3xl font-semibold tracking-wide">
            {channel ? channel.name : ''}
          </h1>
        </div>
      </div>
      <div className="border-t-2 mx-5 border-grey-700 flex "></div>
      <div className={`${mediaStyle.gridContainer} overflow-y-auto`}>
        <div className={'bg-grey-800'}>
          {connectionState === ConnectionState.Connecting ? (
            <div
              className={`flex flex-row items-center relative top-11 mx-auto h-auto ${mediaStyle.channelLoad}`}
            >
              <LoadingIcon className="w-7 h-7 stroke-frost-300 mr-2" />
              <span>Connecting...</span>
            </div>
          ) : (
            <div className={`grid ${mediaStyle.mediaGrid}`}>
              {currentRoom.channel_id === channel?.channel_id &&
                connectionState === ConnectionState.Connected &&
                tracks.map((track) => {
                  if (
                    // @ts-expect-error Fck you livekit
                    (!!track.publication &&
                      // @ts-expect-error Fck you livekit
                      track.publication.source == Track.Source.Camera &&
                      !track.participant.isCameraEnabled) ||
                    // @ts-expect-error Fck you livekit
                    track.publication === undefined
                  ) {
                    return (
                      <>
                        {connectionState === ConnectionState.Connected && (
                          <MediaPlaceholderTrack
                            participant={track.participant}
                          />
                        )}
                      </>
                    );
                  } else {
                    return (
                      <MediaDispTrack
                        key={(track as TrackBundle).publication.trackSid}
                        track={track as TrackBundle}
                      />
                    );
                  }
                })}
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-auto mb-1">
        <FloatingCallControl visibleChannel={visibleChannel} token={token} />
      </div>
    </>
  );
}
