import { useChannelIdValue } from '@/context/ChatCtx';
import styles from '@/styles/DesktopView.module.css';
import VerticalNav from './VerticalNav';

export default function RenderDesktopView() {
  // TODO: change mobileView => mainView
  // if channelId > 0, set main view to chat, else set it to default view for current mobile view
  const channelId = useChannelIdValue();

  return (
    <div className={`${styles.container} h-full`}>
      <div className="col-start-1 col-end-2 bg-grey-950">
        <VerticalNav />
      </div>
      <div className="col-start-2 col-end-4 bg-grey-900"></div>
    </div>
  );
}
