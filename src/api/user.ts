import { get } from "./http";

export interface ActiveVip {
  vip_id?: number;
}

export interface UserProfile {
  nickname?: string;
  name?: string;
  avatar?: string;
  headimg?: string;
  head_img?: string;
  phone?: string;
  active_vips?: ActiveVip;
  user?: UserProfile;
}

export async function fetchMyProfile() {
  const data = await get<UserProfile>("/api/v1/user/my");
  return data?.user ?? data;
}
