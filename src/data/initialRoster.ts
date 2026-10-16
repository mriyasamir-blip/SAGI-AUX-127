import { UserProfile, SystemConfig } from '../types';

export const RAW_ROSTER_DATA = [
  { nik: '20250005', name: 'Pustaka Adam', gender: 'Pria', shift: 1, roleDesc: 'Manager', spv: 'Muhammad Nendi' },
  { nik: '20250013', name: 'Muhammad Riyas Amir', gender: 'Pria', shift: 1, roleDesc: 'PMO/SPV', spv: 'Pustaka Adam' },
  { nik: '20250017', name: 'Edhi Sukriyanto', gender: 'Pria', shift: 3, roleDesc: 'Supervisor', spv: 'Pustaka Adam' },
  { nik: '202601193', name: 'Wahyu Astuti', gender: 'Wanita', shift: 15, roleDesc: 'OIC / Inbound', spv: 'Pustaka Adam' },
  { nik: '202501012', name: 'Dira Ranisa Yustisia', gender: 'Wanita', shift: 1, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202501007', name: 'Cecilia Novica Sari', gender: 'Wanita', shift: 1, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202501100', name: 'Devi Triyani', gender: 'Wanita', shift: 3, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202501063', name: 'Latifah Mardiyati', gender: 'Wanita', shift: 2, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202601143', name: 'Farhatun Jila', gender: 'Pria', shift: 5, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202601151', name: 'Desy Muji Rahayu', gender: 'Wanita', shift: 5, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202601180', name: 'Wahyu Budiarto', gender: 'Pria', shift: 9, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202601185', name: 'Fariz Primasta', gender: 'Pria', shift: 11, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202601186', name: 'Andini', gender: 'Wanita', shift: 11, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202601187', name: 'Miftha Nurzanah', gender: 'Wanita', shift: 11, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202601171', name: 'Yuni Andriyani', gender: 'Wanita', shift: 7, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202501106', name: 'Gilang Lukman Arif Putra', gender: 'Pria', shift: 3, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202601196', name: 'Ridwan Agustin Firmansyah', gender: 'Pria', shift: 16, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202601165', name: 'Syifa Fauziah', gender: 'Wanita', shift: 7, roleDesc: 'Inbound', spv: 'Muhammad Rizki Azhari' },
  { nik: '202601166', name: 'Dina Amaliyah', gender: 'Wanita', shift: 7, roleDesc: 'Inbound', spv: 'Muhammad Rizki Azhari' },
  { nik: '202501045', name: 'Ahmad Samuel Zaki', gender: 'Pria', shift: 2, roleDesc: 'Inbound', spv: 'Muhammad Rizki Azhari' },
  { nik: '202501138', name: 'Dwi Puspita Rini', gender: 'Wanita', shift: 4, roleDesc: 'Inbound', spv: 'Muhammad Rizki Azhari' },
  { nik: '202501137', name: 'Desi Afrani', gender: 'Wanita', shift: 4, roleDesc: 'Inbound', spv: 'Kusuma Warastra' },
  { nik: '202501147', name: 'Fajar Hermawan', gender: 'Pria', shift: 4, roleDesc: 'Inbound', spv: 'Muhammad Rizki Azhari' },
  { nik: '202501053', name: 'Eka Redianto', gender: 'Pria', shift: 2, roleDesc: 'Inbound', spv: 'Muhammad Rizki Azhari' },
  { nik: '202501023', name: 'Januar Rahmawati', gender: 'Wanita', shift: 1, roleDesc: 'Inbound', spv: 'Muhammad Rizki Azhari' },
  { nik: '202501088', name: 'Widya Astuti', gender: 'Wanita', shift: 2, roleDesc: 'Inbound', spv: 'Muhammad Rizki Azhari' },
  { nik: '202601175', name: 'Riyono Imam Saputra', gender: 'Pria', shift: 8, roleDesc: 'Inbound', spv: 'Muhammad Rizki Azhari' },
  { nik: '202601176', name: 'Siti Holilah', gender: 'Wanita', shift: 9, roleDesc: 'Inbound', spv: 'Muhammad Rizki Azhari' },
  { nik: '202601177', name: 'Nurmayati', gender: 'Wanita', shift: 9, roleDesc: 'Inbound', spv: 'Muhammad Rizki Azhari' },
  { nik: '202601197', name: 'Marnianti Pasaribu', gender: 'Wanita', shift: 16, roleDesc: 'Inbound', spv: 'Muhammad Rizki Azhari' },
  { nik: '202501078', name: 'Rizka Suryaningsih Haras', gender: 'Wanita', shift: 2, roleDesc: 'OIC / Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202501097', name: 'Antoni', gender: 'Pria', shift: 3, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202501079', name: 'Rizki Fadhilah', gender: 'Pria', shift: 2, roleDesc: 'Non Voice', spv: 'Mudrik Reza Bahrain' },
  { nik: '202501004', name: 'Audy', gender: 'Wanita', shift: 1, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202501092', name: 'Afrizon', gender: 'Pria', shift: 3, roleDesc: 'Non Voice', spv: 'Mudrik Reza Bahrain' },
  { nik: '202501112', name: 'M. Akil Ahsan Abu', gender: 'Pria', shift: 3, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202501095', name: 'Andryo', gender: 'Pria', shift: 3, roleDesc: 'Non Voice', spv: 'Mudrik Reza Bahrain' },
  { nik: '202501098', name: 'Chaesara Shabrina Septimas', gender: 'Wanita', shift: 3, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202601174', name: 'Aldo Harada', gender: 'Pria', shift: 8, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202601173', name: 'Rizqi Farhan Hadi', gender: 'Pria', shift: 8, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202601178', name: 'Nila Syafitri', gender: 'Wanita', shift: 9, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202501104', name: 'Ervanda Naftallino', gender: 'Pria', shift: 4, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202501132', name: 'Soegani Wijaya', gender: 'Pria', shift: 3, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202501071', name: 'Nurmaya', gender: 'Wanita', shift: 2, roleDesc: 'Non Voice', spv: 'Mudrik Reza Bahrain' },
  { nik: '202501145', name: 'Rina Asriana', gender: 'Wanita', shift: 4, roleDesc: 'Non Voice', spv: 'Mudrik Reza Bahrain' },
  { nik: '202501042', name: 'Shofiati', gender: 'Wanita', shift: 1, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202501027', name: 'Lia Apriyanti', gender: 'Wanita', shift: 1, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202601156', name: 'Retno Wulandari', gender: 'Wanita', shift: 5, roleDesc: 'Non Voice', spv: 'Mudrik Reza Bahrain' },
  { nik: '202601159', name: 'Fajar Budiwan', gender: 'Pria', shift: 7, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202601183', name: 'Desi Rima Liyana', gender: 'Wanita', shift: 9, roleDesc: 'Non Voice', spv: 'Arif Kurniawan' },
  { nik: '202601168', name: 'Juwita Larasati', gender: 'Wanita', shift: 7, roleDesc: 'Non Voice', spv: 'Mudrik Reza Bahrain' },
  { nik: '202501119', name: 'Ragil Endro Prasetyo', gender: 'Pria', shift: 3, roleDesc: 'Non Voice', spv: 'Mudrik Reza Bahrain' },
  { nik: '202601170', name: "Wildan Khuril'ain", gender: 'Pria', shift: 7, roleDesc: 'Non Voice', spv: 'Mudrik Reza Bahrain' },
  { nik: '202601194', name: 'Dinu Awaludin', gender: 'Pria', shift: 15, roleDesc: 'Non Voice', spv: 'Mudrik Reza Bahrain' },
  { nik: '202601192', name: 'Irnawaty Rosyadi', gender: 'Wanita', shift: 15, roleDesc: 'Non Voice', spv: 'Mudrik Reza Bahrain' },
  { nik: '202601190', name: 'Hadi Kurnia', gender: 'Pria', shift: 12, roleDesc: 'OIC / Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202501038', name: 'Rusnita', gender: 'Wanita', shift: 1, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202501101', name: 'Dian Andriani', gender: 'Wanita', shift: 3, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202501026', name: 'Le Andhika', gender: 'Wanita', shift: 1, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202501043', name: 'Siti Triastuti', gender: 'Wanita', shift: 1, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202501057', name: 'Gita kartika', gender: 'Wanita', shift: 2, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202601145', name: 'Yunita Amalia', gender: 'Wanita', shift: 5, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202601148', name: "X'risna Stanisla", gender: 'Wanita', shift: 5, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202601150', name: 'Dhiana Ariani Hutapea', gender: 'Wanita', shift: 5, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202601152', name: 'Ana Thasya Bella', gender: 'Wanita', shift: 5, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202601153', name: 'Devi Setianingsih', gender: 'Wanita', shift: 5, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202601154', name: 'Niekea Guthiearies G.T', gender: 'Wanita', shift: 6, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202601155', name: 'Muyassaroh', gender: 'Wanita', shift: 6, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202601179', name: 'Rahmidita Primanda', gender: 'Wanita', shift: 9, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202601188', name: 'Marisa Rahma Riadi', gender: 'Wanita', shift: 11, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202601184', name: 'Safira Ramadhani Puteri', gender: 'Wanita', shift: 11, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202501054', name: 'Eko Prihtianto', gender: 'Pria', shift: 2, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202601191', name: 'Panji Hadiartha', gender: 'Pria', shift: 15, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202501091', name: 'Yuqi Pujasari', gender: 'Wanita', shift: 2, roleDesc: 'PPID', spv: 'Edy Kurniawan' },
  { nik: '202501036', name: 'Romaria Sri Lelita Sirait', gender: 'Wanita', shift: 1, roleDesc: 'Outbound', spv: 'Edy Kurniawan' },
  { nik: '202501030', name: 'Nur Aryani Bahagiastuti', gender: 'Wanita', shift: 1, roleDesc: 'Outbound', spv: 'Edy Kurniawan' },
  { nik: '202501024', name: 'Karen Rachael Meigy Caunang', gender: 'Wanita', shift: 1, roleDesc: 'Outbound', spv: 'Edy Kurniawan' },
  { nik: '202501077', name: 'Risza Kurnia Sari', gender: 'Wanita', shift: 2, roleDesc: 'Outbound', spv: 'Edy Kurniawan' },
  { nik: '202501084', name: 'Stovina Rosa', gender: 'Wanita', shift: 2, roleDesc: 'Outbound', spv: 'Edy Kurniawan' },
  { nik: '202501039', name: 'Selviana Puspita Sari', gender: 'Wanita', shift: 1, roleDesc: 'Outbound', spv: 'Edy Kurniawan' },
  { nik: '202601195', name: 'Maulida Riyani', gender: 'Wanita', shift: 15, roleDesc: 'Outbound', spv: 'Elisa Kurniaty Pakpahan' },
  { nik: '202501139', name: 'Seftia Marsita Maharani', gender: 'Wanita', shift: 4, roleDesc: 'Outbound', spv: 'Pustaka Adam' },
  { nik: '202501025', name: 'Kusuma Warastra', gender: 'Pria', shift: 1, roleDesc: 'Supervisor', spv: 'Pustaka Adam' },
  { nik: '202501028', name: 'Mudrik Reza Bahrain', gender: 'Pria', shift: 1, roleDesc: 'Supervisor', spv: 'Pustaka Adam' },
  { nik: '20250009', name: 'Arif Kurniawan', gender: 'Pria', shift: 1, roleDesc: 'Supervisor', spv: 'Pustaka Adam' },
  { nik: '20250032', name: 'Elisa Kurniaty Pakpahan', gender: 'Wanita', shift: 4, roleDesc: 'Supervisor', spv: 'Pustaka Adam' },
  { nik: '202501068', name: 'Muhammad Rizki Azhari', gender: 'Pria', shift: 2, roleDesc: 'Supervisor', spv: 'Pustaka Adam' },
  { nik: '202501013', name: 'Edy Kurniawan', gender: 'Pria', shift: 1, roleDesc: 'Supervisor', spv: 'Pustaka Adam' },
  { nik: '20250010', name: 'Febrina', gender: 'Wanita', shift: 1, roleDesc: 'SME', spv: 'Pustaka Adam' },
  { nik: '20250025', name: 'Handy Wibowo', gender: 'Pria', shift: 1, roleDesc: 'SME', spv: 'Pustaka Adam' },
  { nik: '20250022', name: 'Helena Hermelina', gender: 'Wanita', shift: 1, roleDesc: 'SME', spv: 'Pustaka Adam' },
  { nik: '20250021', name: 'Fenny Fentheta', gender: 'Wanita', shift: 2, roleDesc: 'QA', spv: 'Edhi Sukriyanto' },
  { nik: '20250018', name: 'Asni Nuruddini', gender: 'Wanita', shift: 1, roleDesc: 'QA', spv: 'Edhi Sukriyanto' },
  { nik: '20260039', name: 'Tree Mardiana', gender: 'Wanita', shift: 5, roleDesc: 'QA', spv: 'Edhi Sukriyanto' },
  { nik: '202501069', name: 'Mutiara Indonesia', gender: 'Wanita', shift: 2, roleDesc: 'QA', spv: 'Edhi Sukriyanto' },
  { nik: '20260042', name: 'Rozi Saputra', gender: 'Pria', shift: 10, roleDesc: 'QA', spv: 'Edhi Sukriyanto' },
  { nik: '20260044', name: 'Muhamad Syahrir', gender: 'Pria', shift: 15, roleDesc: 'QA', spv: 'Edhi Sukriyanto' },
  { nik: '20250027', name: 'Sendy Ferdiansyah', gender: 'Pria', shift: 1, roleDesc: 'Outbond Support', spv: 'Muhammad Riyas Amir' },
  { nik: '20250028', name: 'Firhan Kamil Ilyasin', gender: 'Pria', shift: 1, roleDesc: 'IT', spv: 'Muhammad Riyas Amir' },
  { nik: '20260040', name: 'Fahmi Ardiansyah', gender: 'Pria', shift: 5, roleDesc: 'IT', spv: 'Muhammad Riyas Amir' },
  { nik: '202501116', name: 'Norma Amalia Lestari', gender: 'Wanita', shift: 3, roleDesc: 'RTFM', spv: 'Muhammad Riyas Amir' },
  { nik: '20260037', name: 'Laily Rahmah Sadidah', gender: 'Wanita', shift: 5, roleDesc: 'Admin', spv: 'Muhammad Riyas Amir' },
  { nik: '20260038', name: 'Bela Nurul Zahra', gender: 'Wanita', shift: 5, roleDesc: 'Admin', spv: 'Muhammad Riyas Amir' },
  { nik: '20250033', name: 'Rifni Azzahra', gender: 'Wanita', shift: 1, roleDesc: 'Outbond Support', spv: 'Muhammad Riyas Amir' },
  { nik: '202501032', name: 'Rahmah Sulistiani', gender: 'Wanita', shift: 1, roleDesc: 'PPID', spv: 'Pustaka Adam' },
  { nik: '202501073', name: 'Ofa Nur Arafah', gender: 'Wanita', shift: 2, roleDesc: 'PPID', spv: 'Pustaka Adam' },
  { nik: '202501115', name: 'Nella Yulianti', gender: 'Wanita', shift: 3, roleDesc: 'PPID', spv: 'Pustaka Adam' },
  { nik: '202501136', name: 'Tyas Khairunnisa', gender: 'Wanita', shift: 4, roleDesc: 'PPID', spv: 'Pustaka Adam' },
  { nik: '20260041', name: 'Bangkit Surya Wijaya', gender: 'Pria', shift: 10, roleDesc: 'PnC', spv: 'Pustaka Adam' },
  { nik: '20260045', name: 'Muhammad Hilman Fauzi', gender: 'Pria', shift: 15, roleDesc: 'Business Development', spv: 'Pustaka Adam' },
  { nik: '20250020', name: 'Fahmi Al Fathir', gender: 'Pria', shift: 1, roleDesc: 'IT', spv: 'Pustaka Adam' },
];

/**
 * Clean username generator following the prompt instructions:
 * "Mohon untuk usernamenya berdasarkan nama depannnya semisalnya, contohnya untuk Ofa Nur Arafah adalah ofa127 password sagi 127"
 */
export function generateUsername(name: string, existingUsernames: Set<string>): string {
  // Normalize first word (remove punctuation like quotes or dots)
  const firstWord = name
    .trim()
    .split(/\s+/)[0]
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  
  let candidate = `${firstWord}127`;
  if (!existingUsernames.has(candidate)) {
    existingUsernames.add(candidate);
    return candidate;
  }

  // If first name already taken, combine with first letter of second word or NIK suffix
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    const secondWordLetter = parts[1].replace(/[^a-zA-Z0-9]/g, '').toLowerCase().charAt(0);
    candidate = `${firstWord}${secondWordLetter}127`;
    if (!existingUsernames.has(candidate)) {
      existingUsernames.add(candidate);
      return candidate;
    }
  }

  // Fallback with increment
  let counter = 2;
  while (existingUsernames.has(`${firstWord}${counter}127`)) {
    counter++;
  }
  candidate = `${firstWord}${counter}127`;
  existingUsernames.add(candidate);
  return candidate;
}

export const CLEAN_INITIAL_USERS: UserProfile[] = [
  {
    id: 'ADMIN.S127',
    nik: 'ADMIN.S127',
    name: 'Admin SAGI 127',
    username: 'Admin.s127',
    password: 'sagi127',
    gender: 'Pria',
    shiftNumber: 1,
    role: 'ADMIN',
    division: 'Management & System Admin',
    supervisorName: '-',
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '202601193',
    nik: '202601193',
    name: 'Wahyu Astuti',
    username: 'wahyu127',
    password: 'sagi127',
    gender: 'Wanita',
    shiftNumber: 15,
    role: 'OIC',
    division: 'OIC / Inbound',
    supervisorName: 'Pustaka Adam',
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
];

export function buildInitialUsers(): UserProfile[] {
  return [...CLEAN_INITIAL_USERS];
}

/**
 * Optional helper if Admin wishes to re-populate the complete 80+ roster
 */
export function buildFullRosterUsers(): UserProfile[] {
  const seenUsernames = new Set<string>(['admin.s127', 'wahyu127']);

  const rosterUsers = RAW_ROSTER_DATA.map((item) => {
    const username = generateUsername(item.name, seenUsernames);
    
    // Determine Role
    let role: 'ADMIN' | 'SPV' | 'OIC' | 'AGENT' = 'AGENT';
    const roleDescLower = item.roleDesc.toLowerCase();
    const nameLower = item.name.toLowerCase();
    
    if (
      nameLower.includes('wahyu astuti') ||
      nameLower.includes('hadi kurnia') ||
      nameLower.includes('rizka suryaningsih') ||
      roleDescLower.includes('oic')
    ) {
      role = 'OIC';
    } else if (roleDescLower.includes('admin')) {
      role = 'ADMIN';
    } else if (
      roleDescLower.includes('supervisor') ||
      roleDescLower.includes('spv') ||
      roleDescLower.includes('pmo') ||
      roleDescLower.includes('manager')
    ) {
      role = 'SPV';
    } else {
      role = 'AGENT';
    }

    return {
      id: item.nik,
      nik: item.nik,
      name: item.name,
      username,
      password: 'sagi127',
      gender: item.gender as 'Pria' | 'Wanita',
      shiftNumber: item.shift,
      role,
      division: item.roleDesc,
      supervisorName: item.spv,
      status: 'active' as const,
      updatedAt: new Date().toISOString(),
    };
  });

  return [...CLEAN_INITIAL_USERS, ...rosterUsers.filter(u => u.id !== '202601193')];
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  id: 'default',
  auxThresholds: {
    BREAK: 60, // 60 minutes
    TOILET: 15, // 15 minutes per session (ketentuan jadwal dihapus)
    SHOLAT: 20, // 20 minutes (ketentuan jadwal dihapus)
    TRAINING: 60, // 60 minutes (pengganti Briefing)
    COACHING: 45, // Jatah 45 Menit terpisah
    COMBINED_ROUTINE_QUOTA: 75, // Kuota gabungan AUX Istirahat, Pray & Toilet: 75 Menit
  },
  shiftSchedule: {
    1: { name: 'Shift 1', hours: '07:00 - 15:00' },
    2: { name: 'Shift 2', hours: '08:00 - 16:00' },
    3: { name: 'Shift 3', hours: '09:00 - 17:00' },
    4: { name: 'Shift 4', hours: '10:00 - 18:00' },
    5: { name: 'Shift 5', hours: '12:00 - 20:00' },
    6: { name: 'Shift 6', hours: '13:00 - 21:00' },
    7: { name: 'Shift 7', hours: '14:00 - 22:00' },
    8: { name: 'Shift 8', hours: '15:00 - 23:00' },
    9: { name: 'Shift 9', hours: '16:00 - 00:00' },
    10: { name: 'Shift 10', hours: '18:00 - 02:00' },
    11: { name: 'Shift 11', hours: '20:00 - 04:00' },
    12: { name: 'Shift 12', hours: '22:00 - 06:00' },
    15: { name: 'Shift 15', hours: '08:30 - 17:30' },
    16: { name: 'Shift 16', hours: '09:30 - 18:30' },
  },
  soundAlertsEnabled: true,
  queueModeActive: false,
  queueModeStartedAt: '',
  queueModeActivatedBy: '',
  queueMessage: '',
  updatedAt: new Date().toISOString(),
};
