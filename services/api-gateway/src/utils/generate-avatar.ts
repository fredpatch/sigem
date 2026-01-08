const profile_imgs_name_list = [
  "Garfield",
  "Tinkerbell",
  "Annie",
  "Loki",
  "Cleo",
  "Angel",
  "Bob",
  "Mia",
  "Coco",
  "Gracie",
  "Bear",
  "Bella",
  "Abby",
  "Harley",
  "Cali",
  "Leo",
  "Luna",
  "Jack",
  "Felix",
  "Kiki",
];
const profile_imgs_collections_list = [
  "notionists-neutral",
  "adventurer-neutral",
  "fun-emoji",
];

export function generateRandomAvatar(): string {
  const name =
    profile_imgs_name_list[
      Math.floor(Math.random() * profile_imgs_name_list.length)
    ];
  const collection =
    profile_imgs_collections_list[
      Math.floor(Math.random() * profile_imgs_collections_list.length)
    ];
  return `https://api.dicebear.com/6.x/${collection}/svg?seed=${name}`;
}
