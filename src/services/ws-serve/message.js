import Wsocket from "@/services/wsocket"
import tool from '@/services/tool'
import env from "../../../config/env"

class Message {

  ws

  timer = null

  interval = 10 * 1000

  constructor() {
    this.ws = new Wsocket(env.wsHost + '/message.io?token=' + tool.getToken(), {
      onOpen: _ => { tool.capsule('INFO', 'Connected to the message server...', 'success') },
      onError: _ => {
        this.ws = undefined
        tool.capsule('INFO', 'Unconnect to the message server...', 'danger')
      },
      onClose: _ => {
        this.ws = undefined
        tool.capsule('INFO', 'Disconnect from the message server...', 'warning')
      },
    }
    )

    this.ws.heartbeat.openHeartbeat = false
  }

  getMessage() {
    if (!tool.getToken()) return;
    this.timer = setInterval(() => {
      if (!tool.getToken()) {
        this.ws && this.ws.close();
        clearInterval(this.timer);
      }
      this.ws && this.ws.send({ event: 'get_unread_message' })
    }, this.interval)
  }

  connection() {
    if (!tool.getToken()) return;
    this.ws.connection()
  }

}

export default Message