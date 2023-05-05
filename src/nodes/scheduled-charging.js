module.exports = function (RED) {
  function ScheduledChargingNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    this.configNode = RED.nodes.getNode('victron-client-id')

    if (!this.configNode) {
      node.status({ fill: 'red', shape: 'dot', text: 'Need a victron config client' })
      return
    } else {
      this.client = this.configNode.client
    }

    node.on('input', function (msg) {

      let scheduleSlotPath = '/Settings/CGwacs/BatteryLife/Schedule/Charge/'
      if (msg.slot) {
        scheduleSlotPath += msg.slot.toString() + '/'
      } else {
        scheduleSlotPath = scheduleSlotPath + '0/'
      }

      if (msg.soc && Number(msg.soc) && Number(msg.soc) >= 0 && Number(msg.soc) <= 100) {
        msg.soc = Number(msg.soc)
      } else {
        msg.soc = 100
      }

      if (msg.day && Number(msg.day) && Number(msg.day) >= 0 && Number(msg.day) <= 9) {
        msg.day = Number(msg.day)
      } else {
        msg.day = 7
      }

      // For EskomSePush API
      if (msg.LoadShedding) {
        msg.active = !msg.payload
        const now = new Date()
        const then = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0, 0, 0)
        const diff = parseInt((now.getTime() - then.getTime()) / 1000)

        if ( msg.LoadShedding.next ) {
          msg.start = diff
          msg.duration = parseInt((msg.LoadShedding.next.start - now.getTime())/1000)
        }
      }

      if (msg.active) {
        this.client.publish('com.victronenergy.settings',
          scheduleSlotPath + 'AllowDischarge', 0)
        this.client.publish('com.victronenergy.settings',
          scheduleSlotPath + 'Duration', Number(msg.duration))
        this.client.publish('com.victronenergy.settings',
          scheduleSlotPath + 'Soc', msg.soc)
        this.client.publish('com.victronenergy.settings',
          scheduleSlotPath + 'Day', Number(msg.day))
        this.client.publish('com.victronenergy.settings',
          scheduleSlotPath + 'Start', Number(msg.start))

      } else {
        this.client.publish('com.victronenergy.settings',
          scheduleSlotPath + 'AllowDischarge', 1)
        this.client.publish('com.victronenergy.settings',
          scheduleSlotPath + 'Day', -7)
        this.client.publish('com.victronenergy.settings',
          scheduleSlotPath + 'Duration', 0)
        this.client.publish('com.victronenergy.settings',
          scheduleSlotPath + 'Soc', 100)

      }

      node.send(msg)
      node.status({
        fill: 'green',
        shape: 'ring',
        text: 'Ok'
      })
    })

    node.on('close', function (done) {
      done()
    })
  }
  RED.nodes.registerType('victron-scheduled-charging', ScheduledChargingNode)
}
