import { world } from "@minecraft/server";
world.afterEvents.playerInventoryItemChange.subscribe((event) => {
  const player = event.player;
  const newItem = event.itemStack;
  if (newItem?.typeId === "simulated:physics_assembler" && !player.hasTag("simulated.achievement.applied_kinematics")) {
    player.addTag("simulated.achievement.applied_kinematics");
    player.sendMessage(
      "bob.toast;simulated.achievement.applied_kinematics"
    );
    world.sendMessage({
      translate: "advancement.chat.task",
      with: {
        rawtext: [
          { text: player.name },
          {
            rawtext: [
              { text: "\xA7a[" },
              { translate: "advancement.simulated.applied_kinematics" },
              { text: "]\xA7r" }
            ]
          }
        ]
      }
    });
    player.playSound("ui.achievement.woosh");
  }
});
