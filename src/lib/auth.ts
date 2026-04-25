import { addLoginLog, addFailedLoginAttempt, addActivity } from './loginLogs';

export interface UserData {
  displayName: string;
  city: string;
  groupId: string;
  partnerName?: string;
}

export function getCurrentUser(): UserData | null {
  const name = localStorage.getItem('userName');
  const city = localStorage.getItem('userCity');
  const groupId = localStorage.getItem('userGroupId');
  const partnerName = localStorage.getItem('partnerName') || undefined;
  
  if (!name || !city || !groupId) return null;
  return { displayName: name, city, groupId, partnerName };
}

export function setCurrentUser(name: string, city: string, groupId?: string): void {
  const sanitizedName = name.trim();
  localStorage.setItem('userName', name.trim());
  localStorage.setItem('userCity', city);
  localStorage.setItem('userGroupId', groupId || sanitizedName.toLowerCase().replace(/\s+/g, ''));
}

export function setPartner(partnerName: string): void {
  localStorage.setItem('partnerName', partnerName);
}

export async function login(name: string, city: string): Promise<boolean> {
  try {
    const userName = name.trim();
    if (!userName || !city) return false;

    setCurrentUser(userName, city);
    
    // Loglama işlemleri (GitHub sürümü için isim üzerinden devam eder)
    await addLoginLog(userName);
    await addActivity(userName, 'login', `${city} şehri ile giriş yapıldı`);
    return true;
  } catch (error) {
    console.error('Giriş sırasında hata:', error);
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    const user = getCurrentUser();
    if (user) {
      await addActivity(user.displayName, 'logout', 'Çıkış yapıldı');
    }
  } catch (error) {
    console.error('Çıkış logu eklenirken hata:', error);
  }
  localStorage.removeItem('userName');
  localStorage.removeItem('userCity');
}

export function getUserDisplayName(user: UserData | null): string {
  return user?.displayName || 'Misafir Kullanıcı';
}

export function getProfilePicture(email: string): string | null {
  return localStorage.getItem(`profile-pic:${email}`);
}

export async function setProfilePicture(email: string, dataUrl: string): Promise<void> {
  localStorage.setItem(`profile-pic:${email}`, dataUrl);
}