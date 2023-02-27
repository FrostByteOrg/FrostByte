export enum ServerPermissions {
  /**
   * No permissions.
   */
  NONE = 0,

  /**
   * The user is the owner of the server.
   */
  OWNER = 1 << 0,

  /**
   * Server administrator. Effectively contains all permissions aside from destructive operations such as delete server
   */
  ADMINISTRATOR = 1 << 1,

  /**
   * Manage server settings, including server name, description, and icon.
   */
  MANAGE_SERVER = 1 << 2,

  /**
   * Manage server channels, including creating, editing, and deleting channels.
   */
  MANAGE_CHANNELS = 1 << 3,

  /**
   * This permission allows the user to manage other users by editing their nickname
   */
  MANAGE_USERS = 1 << 4,

  /**
   * Manage server roles, including creating, editing, and deleting roles.
   */
  MANAGE_ROLES = 1 << 5,

  /**
   * Manage messages, allowing the user to delete other user's messages
   */
  MANAGE_MESSAGES = 1 << 6,

  /**
   * Manage invites, allowing the user to create, edit, and delete invites.
   */
  MANAGE_INVITES = 1 << 7,
}
