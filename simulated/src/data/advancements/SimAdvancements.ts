import { world } from "@minecraft/server";

// 获得物理组装器
world.afterEvents.playerInventoryItemChange.subscribe((event) => {
     const player = event.player;
     const newItem = event.itemStack;

     if (
          newItem?.typeId === "simulated:physics_assembler" &&
          !player.hasTag("simulated.achievement.applied_kinematics")
     ) {
          player.addTag("simulated.achievement.applied_kinematics");
          player.sendMessage(
               "bob.toast;simulated.achievement.applied_kinematics",
          ); //这个是成就的弹出
          world.sendMessage({
               translate: "advancement.chat.task",
               with: {
                    rawtext: [
                         { text: player.name },
                         {
                              rawtext: [
                                   { text: "§a[" },
                                   { translate: "advancement.simulated.applied_kinematics" },
                                   { text: "]§r" },
                              ],
                         },
                    ],
               },
          });
          player.playSound("ui.achievement.woosh");
     }
});
