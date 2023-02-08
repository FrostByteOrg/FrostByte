import {
  MessageWithUsersResponseSuccess,
  MessageWithUsersResponseError,
} from '@/services/message.service';

export default function Message({
  message,
}: {
  message: MessageWithUsersResponseSuccess | MessageWithUsersResponseError;
}) {
  // if message is of type MessagesWithUsersResponseSuccess
  if (isMessageSuccess(message)) {
    return (
      <>
        <div>{message.profiles.username}: {message.content}</div>
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
  return (message as MessageWithUsersResponseSuccess).author_id !== undefined && (message as MessageWithUsersResponseSuccess) !== null && (message as MessageWithUsersResponseSuccess).author_id !== null && message !== null;
}
