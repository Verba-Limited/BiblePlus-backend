/* =====================================================
   AVATAR RESOLUTION

   Most accounts never upload a picture, so `avatar` comes
   back empty and the admin portal renders a blank box.
   Resolve every user to a URL that always renders: their
   own upload when present, otherwise a generated initials
   avatar built from their name.
===================================================== */

const FALLBACK_BG = "6B4EFF"; // BiblePlus brand purple
const FALLBACK_FG = "FFFFFF";

const initialsFor = (user: any): string => {
  const first = (user?.firstName || "").trim();
  const last = (user?.lastName || "").trim();

  if (first || last) return `${first} ${last}`.trim();
  if (user?.username) return String(user.username);
  if (user?.email) return String(user.email).split("@")[0];

  return "User";
};

/** A URL that always renders a picture for this user. */
export const resolveAvatar = (user: any): string => {
  const uploaded = (user?.avatar || "").trim();
  if (uploaded) return uploaded;

  const name = encodeURIComponent(initialsFor(user));
  return `https://ui-avatars.com/api/?name=${name}&background=${FALLBACK_BG}&color=${FALLBACK_FG}&size=256&bold=true`;
};

/**
 * Return a plain object for a user with the picture fields the
 * admin portal expects always populated.
 */
export const withAvatar = (user: any) => {
  if (!user) return user;

  const plain = typeof user.toObject === "function" ? user.toObject() : { ...user };
  const resolved = resolveAvatar(plain);

  return {
    ...plain,
    avatar: resolved,
    // aliases so the portal finds the picture under whichever key it reads
    avatarUrl: resolved,
    profilePicture: resolved,
    hasCustomAvatar: Boolean((plain.avatar || "").trim())
  };
};
