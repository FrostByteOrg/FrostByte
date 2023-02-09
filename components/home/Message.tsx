import {
  MessageWithUsersResponseSuccess,
  MessageWithUsersResponseError,
} from '@/services/message.service';
import UserIcon from '../icons/UserIcon';
import moment from 'moment';

export default function Message({
  message,
}: {
  message: any;
}) {
  // if message is of type MessagesWithUsersResponseSuccess
  if (isMessageSuccess(message)) {
    const pastDate = moment(message.sent_time).format('M/D/YYYY h:mm A');
    const todayDate = moment(message.sent_time).format('h:mm A');
    const displayTime =
      moment(moment(message.sent_time)).isSame(moment(), 'day') &&
      moment(moment(message.sent_time)).isSame(moment(), 'year') &&
      moment(moment(message.sent_time)).isSame(moment(), 'month')
        ? `Today at ${todayDate}`
        : pastDate;

    return (
      <>
        <div className="h-10 px-2 p-4 flex">
          <div className="bg-grey-900 rounded-full mr-3">
            <UserIcon />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="text-xl font-semibold tracking-wider mr-2">
                {message.profiles.username}
              </div>
              <div className="text-xs tracking-wider text-grey-300 mt-1">
                {displayTime}{' '}
              </div>
            </div>
            <div className="font-light tracking-wide">{message.content}</div>
          </div>
        </div>
      </>
    );
  }

  // if message is of type MessagesWithUsersResponseError or null
  return (
    <>
      <div>error</div>
    </>
  );
}

function isMessageSuccess(
  message:
    | MessageWithUsersResponseSuccess
    | MessageWithUsersResponseError
    | null
): message is MessageWithUsersResponseSuccess {
  return (
    (message as MessageWithUsersResponseSuccess).author_id !== undefined &&
    (message as MessageWithUsersResponseSuccess) !== null &&
    (message as MessageWithUsersResponseSuccess).author_id !== null &&
    message !== null
  );
}

export type ChatMessage =
  | MessageWithUsersResponseSuccess
  | MessageWithUsersResponseError;
