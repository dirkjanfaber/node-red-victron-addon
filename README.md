The node(s) in this repository lean on
[@victronenergy/node-red-contrib-victron](https://flows.nodered.org/node/@victronenergy/node-red-contrib-victron)
to make working with the Victron equipment as easy as possible.

# Nodes

Currently this repository consists of a single node:
- schedule charging - this node makes it easy to insert a schedule for ESS control. It is
made to work together with the EskomSePush API node to make sure that the battery is
charged when load shedding is scheduled.


## Schedule charging

This node leans on [@victronenergy/node-red-contrib-victron](https://flows.nodered.org/node/@victronenergy/node-red-contrib-victron) for creating a schedule on a user-friendly way.

It expects an incomming message, containing:

*   `msg.active` - Whether or not to activate the schedule. When \_false\_, it will disable first schedule (unless `msg.slot` has been set, in which case it disables that slot)

Two of the following three values are needed, when `msg.active` has been set to _true_:

*   `msg.start` - Seconds since the start of the day to start schedule.
*   `msg.end` - Seconds since the start of the day to end the schedule.
*   `msg.duration` - Time in seconds the schedule should last.

Note that the `msg.start` and `msg.end` are formatted in seconds since the beginning of the day. So 2:30 at night will become 9000.

Optional other inputs:

*   `msg.soc` - The desired sate of charge, ranging from 0 to 100\>. Defaults to 100 when not given.
*   `msg.day` - Default, the schedule will be set to be active daily (value 7). But this can be overruled by inserting a different value here, using the values:
  *   0 - Sunday
  *   1 - Monday
  *   2 - Tuesday
  *   3 - Wednesday
  *   4 - Thursday
  *   5 - Friday
  *   6 - Saturday
  *   7 - Every day
  *   8 - Weekdays
  *   9 - Weekends

*   `msg.duration` - Duration of the schedule (in seconds)
*   `msg.slot` - The schedule slot to use (0 - 4). Defaults to the first slot (0)

This node has been made to work closely together with the [EskomPush API](https://flows.nodered.org/node/node-red-contrib-eskomsepush) node. So if the input contains the `msg.LoadShedding` field, it will make the schedule fit insert a scheduled charge to fill the battery before the next load shedding event or schedule will become active. It will only add a schedule while loadshedding is not active.

Under the hood the schedule charging node uses the dbus paths of service `com.victronenergy.settings`:

*   `/Settings/CGwacs/BatteryLife/Schedule/Charge/0/AllowDischarge`
*   `/Settings/CGwacs/BatteryLife/Schedule/Charge/0/Duration`
*   `/Settings/CGwacs/BatteryLife/Schedule/Charge/0/Soc`
*   `/Settings/CGwacs/BatteryLife/Schedule/Charge/0/Day`
*   `/Settings/CGwacs/BatteryLife/Schedule/Charge/0/Start`

### Status

After receiving correct input, the status will become green, showing an "_Ok_". If the input was unexpected, the status becomes red and the text should give a clue on what went wrong.
