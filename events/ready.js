const activities = [
  { name: "richdesign", type: "WATCHING" },
  { name: "Uygun fiyata tasarım hizmeti", type: "WATCHING" },
  { name: "Aktif destek taleplerini", type: "WATCHING" },
  { name: "Discord Sunucusunu", type: "WATCHING" }
];

let currentIndex = 0;

module.exports = (client) => {
  console.log(`Bot Durumu Güncellendi${client.user.tag}`);

  setInterval(() => {
    const activity = activities[currentIndex];
    client.user.setActivity(activity.name, { type: activity.type });
    currentIndex = (currentIndex + 1) % activities.length;
  }, 3000); // 15 saniyede bir aktivite değiştirilir
};
