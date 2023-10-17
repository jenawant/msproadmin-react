import { message, notification, Tag } from 'antd';
import { groupBy, sum } from 'lodash';

import React, { useState } from 'react';
import styles from './index.less';
import NoticeIcon from './NoticeIcon';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import queueMessage from '@/services/api/system/queueMessage';
import WsMessage from '@/services/ws-serve/message';
import { BellTwoTone, NotificationTwoTone, SoundTwoTone } from '@ant-design/icons';

export type GlobalHeaderRightProps = {
  fetchingNotices?: boolean;
  onNoticeVisibleChange?: (visible: boolean) => void;
  onNoticeClear?: (tabName?: string) => void;
};

const getNoticeData = (notices: API.NoticeIconItem[]): Record<string, API.NoticeIconItem[]> => {
  if (!notices || notices.length === 0 || !Array.isArray(notices)) {
    return {};
  }

  const newNotices = notices.map((notice) => {
    const newNotice = { ...notice };

    if (newNotice.created_at) {
      newNotice.created_at = dayjs(notice.created_at as string).fromNow();
    }

    if (newNotice.id) {
      newNotice.key = newNotice.id;
    }

    if (newNotice.extra && newNotice.status) {
      const color = {
        todo: '',
        processing: 'blue',
        urgent: 'red',
        doing: 'gold',
      }[newNotice.status];
      newNotice.extra = (
        <Tag
          color={color}
          style={{
            marginRight: 0,
          }}
        >
          {newNotice.extra}
        </Tag>
      ) as any;
    }
    if (newNotice.content_type === 'notice') {
      newNotice.title = '';
      newNotice.send_user.avatar = <NotificationTwoTone twoToneColor="#eb2f96" />;
    }
    if (newNotice.content_type === 'announcement') {
      newNotice.title = '';
      newNotice.send_user.avatar = <SoundTwoTone twoToneColor="#52c41a" />;
    }
    if (newNotice.content_type === 'todo') {
      newNotice.send_user.avatar = '';
      newNotice.created_at = '';
    }

    return newNotice;
  });
  return groupBy(newNotices, 'content_type');
};

const getUnreadData = (noticeData: Record<string, API.NoticeIconItem[]>) => {
  const unreadMsg: Record<string, number> = {};
  Object.keys(noticeData).forEach((key) => {
    const value = noticeData[key];

    if (!unreadMsg[key]) {
      unreadMsg[key] = 0;
    }

    if (Array.isArray(value)) {
      unreadMsg[key] = value.filter((item) => !item.read).length;
    }
  });
  return unreadMsg;
};

const Wsm = new WsMessage();
Wsm.connection();
Wsm.getMessage();

const NoticeIconView: React.FC = () => {
  const [notices, setNotices] = useState<API.NoticeIconItem[]>([]);

  Wsm?.ws?.on('ev_new_message', (msg: any, mdata: any) => {
    if (mdata.length > notices.length) {
      notification.info({
        message: '新消息',
        description: '收到新消息，请及时查看',
        placement: 'bottomRight',
      });
      setNotices(mdata);
    }
  });

  const noticeData = getNoticeData(notices);
  const unreadMsg = getUnreadData(noticeData || {});

  const changeReadState = (id: number) => {
    setNotices(
      notices.map((item) => {
        const notice = { ...item };
        if (notice.id === id) {
          notice.read = true;
        }
        return notice;
      }),
    );
    queueMessage.updateReadStatus({ ids: id });
  };

  const clearReadState = async (title: string, key: string) => {
    const ids: React.Key[] = [];
    setNotices(
      notices.map((item) => {
        const notice = { ...item };
        if (notice.content_type === key) {
          notice.read = true;
          ids.push(notice.id);
        }
        return notice;
      }),
    );
    queueMessage.updateReadStatus({ ids: ids }).then(() => {
      message.success(`${'清空了'} ${title}`);
      setTimeout(() => setNotices(notices.filter((item) => item.content_type !== key)), 1000);
    });
  };

  return (
    <NoticeIcon
      className={styles.action}
      count={sum(Object.values(unreadMsg))}
      onItemClick={(item) => {
        changeReadState(item.id!);
      }}
      onClear={(title: string, key: string) => clearReadState(title, key)}
      loading={false}
      clearText="清空"
      viewMoreText="查看更多"
      onViewMore={() => message.info('Click on view more')}
      clearClose
      bell={<BellTwoTone twoToneColor="#ff7a45" style={{ padding: 4, verticalAlign: 'middle' }} />}
    >
      <NoticeIcon.Tab
        tabKey="notice"
        count={unreadMsg.notice}
        list={noticeData.notice}
        title="通知"
        emptyText="你已查看所有通知"
        showViewMore
      />
      <NoticeIcon.Tab
        tabKey="announcement"
        count={unreadMsg.announcement}
        list={noticeData.announcement}
        title="公告"
        emptyText="你已查看所有公告"
        showViewMore
      />
      <NoticeIcon.Tab
        tabKey="private_message"
        count={unreadMsg.private_message}
        list={noticeData.private_message}
        title="消息"
        emptyText="您已读完所有消息"
        showViewMore
      />
      <NoticeIcon.Tab
        tabKey="todo"
        title="待办"
        emptyText="你已完成所有待办"
        count={unreadMsg.todo}
        list={noticeData.todo}
        showViewMore
      />
    </NoticeIcon>
  );
};

export default NoticeIconView;
