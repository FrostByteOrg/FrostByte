import Modal from '@/components/home/modals/Modal';
import EditUser from '@/components/home/EditUserMenu';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Profile } from '@/types/dbtypes';
import FAQItem from '@/components/home/FAQItem';
import ServerHover from '../../../public/serverHover.png';
import Image from 'next/image';
import { useMediaQuery } from 'react-responsive';

export default function FAQModal({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}) {
  const faqRef = useRef<HTMLDialogElement>(null);

  const checkMobile = useMediaQuery({ query: '(max-width: 630px)' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(checkMobile);
  }, [checkMobile]);

  return (
    <Modal
      modalRef={faqRef}
      showModal={showModal}
      className={`${isMobile ? 'w-13' : 'w-15'} h-[522px] overflow-y-auto`}
      title={
        <div>
          {' '}
          <span className="text-4xl ">F</span>requently{' '}
          <span className="text-4xl mr-[2px]">A</span>sked{' '}
          <span className="text-4xl mr-[1px]">Q</span>
          uestions
        </div>
      }
      buttons={
        <>
          <div
            className=" hover:cursor-pointer"
            onClick={() => {
              setShowModal(false);
              faqRef.current?.close();
            }}
          >
            Close
          </div>
        </>
      }
    >
      <div className="flex-col justify-between">
        <FAQItem
          question="What is FrostByte?"
          answer={
            <div>
              FrostByte is an innovative, open-source application that empowers
              users to connect and engage effortlessly through a multitude of
              communication channels. Seamlessly blending instant messaging,
              high-quality voice and video calls, and diverse media sharing
              options. Drawing inspiration from the acclaimed platform Discord,
              FrostByte introduces the concept of servers.
              <br></br>
              <br></br>
              In FrostByte, servers serve as virtual hubs where like-minded
              individuals can gather, share ideas, and collaborate effortlessly.
              Each server contains channels, channels are virtual spaces within
              a server where users can engage in focused discussions, share
              content, and collaborate on specific topics or activities. They
              provide a platform for text-based conversations, enabling users to
              exchange messages, share links, and discuss ideas in real-time.
              Additionally, channels support voice and video functionality,
              empowering users to engage in voice calls, video conferences, or
              even host events within dedicated spaces.
            </div>
          }
        />
        <FAQItem
          question="How do I create a server?"
          answer={
            <div className="flow-root">
              <div className="">
                To create a server, first make sure that you are located in the
                servers tab the text on the top left of your screen should say
                &apos;Servers&apos;. Then simply hover over and click the icon
                next to the &apos;Servers&apos; text, provide the necessary
                information, click submit and you should see your server appear
                in the left-hand panel
              </div>
              <div className="float-right">
                <Image
                  alt="ServerHover"
                  src={ServerHover}
                  className="w-auto h-7 rounded-lg "
                />
              </div>
            </div>
          }
        />
        <FAQItem
          question="How do I join a server?"
          answer="To join a server, you need a valid server invite. The invite can take the shape of either a URL or it can be pasted and seen in a chat. Server invites can be accepted in two various ways, if you have the URL invite, simply paste it in your browser address bar and it should redirect you to an appropriate page where you can then accept the invite. If you see an invite in a given chat, simply press the 'Join' button."
        />
        <FAQItem
          question="How do I create a server invite?"
          answer="To create an invite to your server, simply expand your server so that all of the channels are showing. Next, right click on any channel and you should see an option to create an invite. Follow the instructions, once created the invite link will copied to your clipboard, simply paste it anywhere and you should be set!"
        />
      </div>
    </Modal>
  );
}
