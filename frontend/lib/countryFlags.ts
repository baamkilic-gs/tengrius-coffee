/** Türkçe ülke adı → ISO 3166-1 alpha-2 kodu (lib/countries.ts listesiyle aynı kapsam). */
const COUNTRY_ISO2: Record<string, string> = {
  Afganistan: "AF", Almanya: "DE", "Amerika Birleşik Devletleri": "US", Andorra: "AD",
  Angola: "AO", "Antigua ve Barbuda": "AG", Arjantin: "AR", Arnavutluk: "AL",
  Avustralya: "AU", Avusturya: "AT", Azerbaycan: "AZ", Bahamalar: "BS", Bahreyn: "BH",
  Bangladeş: "BD", Barbados: "BB", Belarus: "BY", Belçika: "BE", Belize: "BZ",
  Benin: "BJ", Bhutan: "BT", "Birleşik Arap Emirlikleri": "AE", Bolivya: "BO",
  "Bosna Hersek": "BA", Botsvana: "BW", Brezilya: "BR", Brunei: "BN", Bulgaristan: "BG",
  "Burkina Faso": "BF", Burundi: "BI", Butan: "BT", Cezayir: "DZ", Çad: "TD",
  Çekya: "CZ", Çin: "CN", Danimarka: "DK", "Doğu Timor": "TL", "Dominik Cumhuriyeti": "DO",
  Dominika: "DM", Ekvador: "EC", "Ekvator Ginesi": "GQ", "El Salvador": "SV",
  Endonezya: "ID", Eritre: "ER", Ermenistan: "AM", Estonya: "EE", Esvatini: "SZ",
  Etiyopya: "ET", Fas: "MA", Fiji: "FJ", "Fildişi Sahili": "CI", Filipinler: "PH",
  Filistin: "PS", Finlandiya: "FI", Fransa: "FR", Gabon: "GA", Gambiya: "GM",
  Gana: "GH", Gine: "GN", "Gine-Bissau": "GW", Grenada: "GD", Guatemala: "GT",
  Guyana: "GY", "Güney Afrika": "ZA", "Güney Kore": "KR", "Güney Sudan": "SS",
  Gürcistan: "GE", Haiti: "HT", Hindistan: "IN", Hırvatistan: "HR", Hollanda: "NL",
  Honduras: "HN", İngiltere: "GB", Irak: "IQ", İran: "IR", İrlanda: "IE", İspanya: "ES",
  İsrail: "IL", İsveç: "SE", İsviçre: "CH", İtalya: "IT", İzlanda: "IS", Jamaika: "JM",
  Japonya: "JP", Kamboçya: "KH", Kamerun: "CM", Kanada: "CA", Karadağ: "ME", Katar: "QA",
  Kazakistan: "KZ", Kenya: "KE", Kırgızistan: "KG", Kiribati: "KI", Kolombiya: "CO",
  Komorlar: "KM", "Kongo Cumhuriyeti": "CG", "Kongo Demokratik Cumhuriyeti": "CD",
  Kosova: "XK", "Kosta Rika": "CR", Kuveyt: "KW", "Kuzey Kore": "KP", "Kuzey Makedonya": "MK",
  Küba: "CU", Laos: "LA", Lesotho: "LS", Letonya: "LV", Liberya: "LR", Libya: "LY",
  Lihtenştayn: "LI", Litvanya: "LT", Lübnan: "LB", Lüksemburg: "LU", Macaristan: "HU",
  Madagaskar: "MG", Malavi: "MW", Maldivler: "MV", Malezya: "MY", Mali: "ML", Malta: "MT",
  "Marshall Adaları": "MH", Meksika: "MX", Mısır: "EG", Mikronezya: "FM", Moğolistan: "MN",
  Moldova: "MD", Monako: "MC", Mozambik: "MZ", Myanmar: "MM", Namibya: "NA", Nauru: "NR",
  Nepal: "NP", Nijer: "NE", Nijerya: "NG", Nikaragua: "NI", Norveç: "NO", Özbekistan: "UZ",
  Pakistan: "PK", Palau: "PW", Panama: "PA", "Papua Yeni Gine": "PG", Paraguay: "PY",
  Peru: "PE", Polonya: "PL", Portekiz: "PT", Romanya: "RO", Ruanda: "RW", Rusya: "RU",
  "Saint Kitts ve Nevis": "KN", "Saint Lucia": "LC", "Saint Vincent ve Grenadinler": "VC",
  Samoa: "WS", "San Marino": "SM", "Sao Tome ve Principe": "ST", Senegal: "SN",
  Sırbistan: "RS", Seyşeller: "SC", "Sierra Leone": "SL", Singapur: "SG", Slovakya: "SK",
  Slovenya: "SI", "Solomon Adaları": "SB", Somali: "SO", "Sri Lanka": "LK", Sudan: "SD",
  Surinam: "SR", Suriye: "SY", "Suudi Arabistan": "SA", Şili: "CL", Tacikistan: "TJ",
  Tanzanya: "TZ", Tayland: "TH", Tayvan: "TW", Togo: "TG", Tonga: "TO",
  "Trinidad ve Tobago": "TT", Tunus: "TN", Türkiye: "TR", Türkmenistan: "TM", Tuvalu: "TV",
  Uganda: "UG", Ukrayna: "UA", Umman: "OM", Uruguay: "UY", Ürdün: "JO", Vanuatu: "VU",
  Vatikan: "VA", Venezuela: "VE", Vietnam: "VN", Yemen: "YE", "Yeni Zelanda": "NZ",
  Yunanistan: "GR", Zambiya: "ZM", Zimbabve: "ZW",
};

/** ISO2 kodunu bölgesel gösterge sembolleriyle bayrak emojisine çevirir (ör. "TR" → 🇹🇷). */
function toFlagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Türkçe ülke adından bayrak emojisi döndürür; eşleşme yoksa boş string. */
export const flagFor = (countryName: string | null | undefined): string => {
  if (!countryName) return "";
  const code = COUNTRY_ISO2[countryName];
  return code ? toFlagEmoji(code) : "";
};
