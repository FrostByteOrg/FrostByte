import {
  useChannel,
  useCurrentRoomRef,
  useSetConnectionState,
  useSetCurrentRoomId,
  useSetCurrentRoomName,
  useSetCurrentRoomServerId,
  useSetToken,
  useUserRef,
} from '@/lib/store';
import styles from '@/styles/Chat.module.css';
import mediaStyle from '@/styles/Components.module.css';
import { ChannelMediaIcon } from '../icons/ChannelMediaIcon';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useUser } from '@supabase/auth-helpers-react';
import {
  AudioTrack,
  DisconnectButton,
  ParticipantName,
  ParticipantTile,
  TrackToggle,
  VideoTrack,
  useConnectionState,
  useLocalParticipant,
  useToken,
  useParticipants,
} from '@livekit/components-react';
import { Track, ConnectionState } from 'livekit-client';
import { Channel, User } from '@/types/dbtypes';
import { BsCameraVideo, BsCameraVideoOff, BsGear } from 'react-icons/bs';
import { TbScreenShare, TbScreenShareOff } from 'react-icons/tb';
import UserIcon from '../icons/UserIcon';

export default function MediaChat({
  channel: visableChannel,
}: {
  channel?: Channel;
}) {
  const channel = useChannel();
  const userID: User | any = useUser();
  const user = useUserRef();
  const setToken = useSetToken();
  const videoTrack = useLocalParticipant();
  const screenTrack = useLocalParticipant();
  const setConnectionState = useSetConnectionState();
  const connectionState = useConnectionState();
  const setRoomIdRef = useSetCurrentRoomId();
  const setRoomName = useSetCurrentRoomName();
  const currentRoom = useCurrentRoomRef();
  const setRoomServerId = useSetCurrentRoomServerId();

  const participants = useParticipants();

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

  return (
    <>
      {currentRoom.channel_id !== channel?.channel_id &&
      connectionState === ConnectionState.Connected ? (
          <>
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
            <div className={'h-full relative'}>
              <div
                className={
                  'bg-grey-800 h-full w-full flex items-center justify-center'
                }
              >
                <div
                  className={`h-11 w-13 bg-grey-500 rounded-lg ${mediaStyle.mediaError} border-2 opacity-70 flex flex-col items-center justify-center`}
                >
                  <span className="text-lg font-bold">
                    You are connected to {currentRoom.name}
                  </span>
                  <span className="text-lg font-bold">Please end your call</span>
                </div>
                <div
                  className={`flex flex-row justify-evenly ${mediaStyle.mediaControls} mb-5 w-8 bg-grey-950 py-3 items-center rounded-xl absolute bottom-1 inset-x-1 mx-auto`}
                >
                  <DisconnectButton
                    className={
                      'w-7 h-7 bg-red-500 hover:bg-red-700 rounded-lg font-bold text-xl'
                    }
                    onClick={() => {
                      setConnectionState(false);
                      setRoomIdRef(0);
                      setRoomName(undefined);
                    }}
                  >
                  End
                  </DisconnectButton>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
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
            <div className={'h-full'}>
              <div className={'bg-grey-800 w-full items-center'}>
                <div className="w-full">
                  <div className="grid gap-2 grid-cols-2 p-5 space-x-4 overflow-auto">
                    {connectionState === ConnectionState.Connecting ? (
                      <div className="flex flex-row items-center mt-2">
                        <BsGear size={40} className="animate-spin mr-2" />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      participants.map((participant) => (
                        <ParticipantTile key={participant.sid} participant={participant}>
                          <div>
                            { (participant.isCameraEnabled || participant.isScreenShareEnabled) ?
                              (
                                <div>
                                  {participant.isCameraEnabled && (
                                    <div>
                                      <VideoTrack
                                        source={Track.Source.Camera}
                                        participant={participant}
                                        className={'rounded-lg'}
                                      />
                                      <ParticipantName
                                        participant={participant}
                                        className="
                                          text-lg
                                          font-semibold
                                          mt-2
                                          py-1
                                          px-2
                                          rounded-md
                                          bg-slate-900
                                          text-center
                                          float-right
                                          relative
                                          bottom-7
                                          right-2
                                        "
                                      />
                                    </div>
                                  )}
                                  {participant.isScreenShareEnabled && (
                                    <div>
                                      <VideoTrack
                                        participant={participant}
                                        source={Track.Source.ScreenShare}
                                        className={'rounded-lg'}
                                      />
                                      <ParticipantName
                                        participant={participant}
                                        className="
                                          text-lg
                                          font-semibold
                                          mt-2
                                          py-1
                                          px-2
                                          rounded-md
                                          bg-slate-900
                                          text-center
                                          float-right
                                          relative
                                          bottom-7
                                          right-2
                                        "
                                      />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="bg-gray-600 rounded-lg">
                                  <img
                                    className='rounded-lg'
                                    src="https://designshack.net/wp-content/uploads/placehold.jpg"
                                    alt=""
                                  />
                                  <ParticipantName
                                    participant={participant}
                                    className="
                                      text-lg
                                      font-semibold
                                      mt-2
                                      py-1
                                      px-2
                                      rounded-md
                                      bg-slate-900
                                      text-center
                                      float-right
                                      relative
                                      bottom-7
                                      right-2
                                    "
                                  />
                                </div>
                              )
                            }
                          </div>
                          <AudioTrack source={Track.Source.Microphone} participant={participant}/>
                        </ParticipantTile>
                      ))
                    )}
                  </div>
                  <div
                    className={`
                      flex
                      flex-row
                      justify-evenly
                      ${mediaStyle.mediaControls}
                      mb-5
                      min-w-0
                      bg-grey-950
                      py-3
                      items-center
                      rounded-xl
                      absolute
                      bottom-1
                      inset-x-1
                      mx-auto
                    `}
                  >
                    {connectionState === ConnectionState.Connected && (
                      <TrackToggle
                        showIcon={false}
                        className={
                          'w-7 h-7 bg-grey-900 hover:bg-grey-800 rounded-lg text-lg flex items-center justify-center'
                        }
                        source={Track.Source.Camera}
                      >
                        {videoTrack.isCameraEnabled ? (
                          <BsCameraVideo
                            size={22}
                          />
                        ) : (
                          <BsCameraVideoOff
                            size={22}
                          />
                        )}
                      </TrackToggle>
                    )}
                    {connectionState === ConnectionState.Connected && (
                      <TrackToggle
                        showIcon={false}
                        className={
                          'w-7 h-7 bg-grey-900 hover:bg-grey-800 rounded-lg text-lg flex items-center justify-center'
                        }
                        source={Track.Source.ScreenShare}
                      >
                        {screenTrack.isScreenShareEnabled ? (
                          <TbScreenShare size={22} />
                        ) : (
                          <TbScreenShareOff size={22} />
                        )}
                      </TrackToggle>
                    )}
                    {connectionState !== ConnectionState.Connected ? (
                      <button
                        className="w-7 h-7 bg-green-500 hover:bg-green-700 rounded-lg font-bold text-md"
                        onClick={() => {
                          setConnectionState(true),
                          setToken(token),
                          setRoomIdRef(visableChannel?.channel_id);
                          setRoomName(visableChannel?.name);
                          setRoomServerId(visableChannel?.server_id);
                        }}
                      >
                        {' '}
                      Join{' '}
                      </button>
                    ) : (
                      <DisconnectButton
                        className={
                          'w-7 h-7 bg-red-500 hover:bg-red-700 rounded-lg font-bold text-xl'
                        }
                        onClick={() => {
                          setConnectionState(false);
                        }}
                      >
                        {' '}
                      End{' '}
                      </DisconnectButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
    </>
  );
}
