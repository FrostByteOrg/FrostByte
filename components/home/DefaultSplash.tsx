import { FrostcordSnowflake } from '@/components/icons/FrostcordSnowflake';
import anim from '@/styles/Default.module.css';
import { useServers } from '@/lib/store';
import { useQueryClient } from 'react-query';
import useGetServerQuery from '@/lib/fetchHelpers';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import InfoIcon from '../icons/InfoIcon';
import FAQModal from './modals/FAQModal';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

export default function DefaultSplash({
  showFAQ = false,
}: {
  showFAQ?: boolean;
}) {
  const user = useUser();
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();
  const {
    data: servers,
    error,
    refetch,
  } = useGetServerQuery(supabase, user?.id);

  const checkMobile = useMediaQuery({ query: '(max-width: 940px)' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(checkMobile);
  }, [checkMobile]);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoHover, setInfoHover] = useState(false);
  return (
    <div className="w-full h-full flex flex-col items-center">
      <FrostcordSnowflake
        className={`fill-slate-600 w-full  h-full ${anim.snowFlakeAnim}`}
        fillColor="#8a94a633"
      />
      {servers && servers.length === 0 && (
        <div className="w-full  text-gray-400 mb-8  animate-pulse">
          <h1 className="text-xl italic text-center">
            {"Looks like you're not a part of any servers..."}
          </h1>
          <h2 className="text-xl italic text-center">
            {'Why not create or join one?'}
          </h2>

          {showFAQ ? (
            <h2 className="text-xl flex justify-center items-center mt-2 ">
              <span className="italic text-center">
                Click here to learn more
              </span>
              <InfoIcon
                onMouseEnter={() => setInfoHover(true)}
                onMouseLeave={() => setInfoHover(false)}
                onClick={() => setShowInfoModal(!showInfoModal)}
                className=" hover:cursor-pointer ml-2"
                hovered={infoHover}
              />
              {showInfoModal ? (
                <FAQModal
                  showModal={showInfoModal}
                  setShowModal={setShowInfoModal}
                />
              ) : (
                ''
              )}
            </h2>
          ) : (
            ''
          )}
        </div>
      )}
    </div>
  );
}
