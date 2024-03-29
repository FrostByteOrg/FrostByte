export enum ServerPermissions {
  /**
   * 0
   * No permissions.
   */
  NONE = 0,

  /**
   * 4
   * Manage server settings, including server name, description, and icon.
   */
  MANAGE_SERVER = 1 << 2,

  /**
   * 8
   * Manage server channels, including creating, editing, and deleting channels.
   */
  MANAGE_CHANNELS = 1 << 3,

  /**
   * 16
   * This permission allows the user to manage other users by editing their nickname
   */
  MANAGE_USERS = 1 << 4,

  /**
   * 32
   * Manage server roles, including creating, editing, and deleting roles.
   */
  MANAGE_ROLES = 1 << 5,

  /**
   * 64
   * Manage messages, allowing the user to delete other user's messages
   */
  MANAGE_MESSAGES = 1 << 6,

  /**
   * 128
   * Manage invites, allowing the user to create, edit, and delete invites.
   */
  MANAGE_INVITES = 1 << 7,

  /**
   * 256
   * Create invites, allowing the user to create invites.
   */
  CREATE_INVITES = 1 << 8,

  /**
   * 510
   * Server administrator. Effectively contains all permissions aside from destructive operations such as delete server
   */
  ADMINISTRATOR = 2
    | ServerPermissions.MANAGE_SERVER
    | ServerPermissions.MANAGE_CHANNELS
    | ServerPermissions.MANAGE_USERS
    | ServerPermissions.MANAGE_ROLES
    | ServerPermissions.MANAGE_MESSAGES
    | ServerPermissions.MANAGE_INVITES
    | ServerPermissions.CREATE_INVITES,

  /**
   * 511
   * The user is the owner of the server.
   */
  OWNER = 1 | ServerPermissions.ADMINISTRATOR,
}

export enum ChannelPermissions {
  /**
   * 0
   * No permissions.
   */
  NONE = 0,

  /**
   * 1
   * Manage messages, allowing the user to delete other user's messages and pin messages.
   */
  MANAGE_MESSAGES = 1 << 0,

  /**
   * 2
   * User can send messages in the channel.
   */
  SEND_MESSAGES = 1 << 1,

  /**
   * 4
   * User can read messages in the channel.
   */
  READ_MESSAGES = 1 << 2,
}
