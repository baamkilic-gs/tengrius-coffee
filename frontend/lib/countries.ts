/**
 * Ülke seçim alanlarında kullanılan liste. Alfabetik DEĞİL — en çok çiğ kahve
 * üreten ülkeler (dünya üretim hacmine göre) en başta gösterilir, çünkü
 * seçenekler bunlardan oluşuyor ve 80'i geçmiyor; alfabetik sırada aramak
 * en sık kullanılan ülkeleri bulmayı zorlaştırıyordu.
 */
const TOP_COFFEE_PRODUCERS = [
  "Brezilya", "Vietnam", "Kolombiya", "Endonezya", "Etiyopya", "Honduras",
  "Hindistan", "Uganda", "Meksika", "Guatemala", "Peru", "Nikaragua", "Çin",
  "Kosta Rika", "Kenya", "Papua Yeni Gine", "El Salvador", "Ekvador",
  "Tanzanya", "Fildişi Sahili",
];

const OTHER_COUNTRIES = [
  "Afganistan", "Almanya", "Amerika Birleşik Devletleri", "Andorra", "Angola",
  "Antigua ve Barbuda", "Arjantin", "Arnavutluk", "Avustralya", "Avusturya",
  "Azerbaycan", "Bahamalar", "Bahreyn", "Bangladeş", "Barbados", "Belarus",
  "Belçika", "Belize", "Benin", "Bhutan", "Birleşik Arap Emirlikleri",
  "Bolivya", "Bosna Hersek", "Botsvana", "Brunei", "Bulgaristan",
  "Burkina Faso", "Burundi", "Butan", "Cezayir", "Çad", "Çekya",
  "Danimarka", "Doğu Timor", "Dominik Cumhuriyeti", "Dominika",
  "Ekvator Ginesi", "Eritre", "Ermenistan",
  "Estonya", "Esvatini", "Fas", "Fiji",
  "Filipinler", "Filistin", "Finlandiya", "Fransa", "Gabon", "Gambiya",
  "Gana", "Gine", "Gine-Bissau", "Grenada", "Guyana",
  "Güney Afrika", "Güney Kore", "Güney Sudan", "Gürcistan", "Haiti",
  "Hırvatistan", "Hollanda",
  "İngiltere", "Irak", "İran", "İrlanda", "İspanya", "İsrail", "İsveç",
  "İsviçre", "İtalya", "İzlanda", "Jamaika", "Japonya", "Kamboçya",
  "Kamerun", "Kanada", "Karadağ", "Katar", "Kazakistan",
  "Kırgızistan", "Kiribati", "Komorlar", "Kongo Cumhuriyeti",
  "Kongo Demokratik Cumhuriyeti", "Kosova", "Kuveyt", "Kuzey Kore",
  "Kuzey Makedonya", "Küba", "Laos", "Lesotho", "Letonya", "Liberya",
  "Libya", "Lihtenştayn", "Litvanya", "Lübnan", "Lüksemburg", "Macaristan",
  "Madagaskar", "Malavi", "Maldivler", "Malezya", "Mali", "Malta",
  "Marshall Adaları", "Mısır", "Mikronezya", "Moğolistan",
  "Moldova", "Monako", "Mozambik", "Myanmar", "Namibya", "Nauru", "Nepal",
  "Nijer", "Nijerya", "Norveç", "Özbekistan", "Pakistan",
  "Palau", "Panama", "Paraguay", "Polonya",
  "Portekiz", "Romanya", "Ruanda", "Rusya", "Saint Kitts ve Nevis",
  "Saint Lucia", "Saint Vincent ve Grenadinler", "Samoa", "San Marino",
  "Sao Tome ve Principe", "Senegal", "Sırbistan", "Seyşeller", "Sierra Leone",
  "Singapur", "Slovakya", "Slovenya", "Solomon Adaları", "Somali", "Sri Lanka",
  "Sudan", "Surinam", "Suriye", "Suudi Arabistan", "Şili", "Tacikistan",
  "Tayland", "Tayvan", "Togo", "Tonga", "Trinidad ve Tobago",
  "Tunus", "Türkiye", "Türkmenistan", "Tuvalu", "Ukrayna",
  "Umman", "Uruguay", "Ürdün", "Vanuatu", "Vatikan", "Venezuela",
  "Yemen", "Yeni Zelanda", "Yunanistan", "Zambiya", "Zimbabve",
].sort((a, b) => a.localeCompare(b, "tr"));

export const COUNTRIES = [...TOP_COFFEE_PRODUCERS, ...OTHER_COUNTRIES].filter(
  (v, i, arr) => arr.indexOf(v) === i,
);
