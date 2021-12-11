import { getCardName, getStartSeedString, onSetSeed } from "isaacscript-common";
import * as seeds from "./seeds.json";

// Constants
const MOD_NAME = "isaac-seed-checker";
const VERBOSE = true;

// Variables
let seedIndex = -1;
let restartOnNextFrame = false;

export function main(): void {
  const mod = RegisterMod(MOD_NAME, 1);

  mod.AddCallback(ModCallbacks.MC_POST_RENDER, postRender); // 2
  mod.AddCallback(ModCallbacks.MC_POST_GAME_STARTED, postGameStarted); // 15

  Isaac.DebugString(`${MOD_NAME} initialized.`);
}

// ModCallbacks.MC_POST_RENDER (2)
function postRender() {
  if (!restartOnNextFrame) {
    return;
  }
  restartOnNextFrame = false;

  seedIndex += 1;
  const seed = seeds[seedIndex];
  if (seed === undefined) {
    Isaac.DebugString("Done checking all of the seeds!");
  } else {
    Isaac.ExecuteCommand(`seed ${seed}`);
  }
}

// ModCallbacks.MC_POST_GAME_STARTED (15)
function postGameStarted(continued: boolean) {
  const startSeedString = getStartSeedString();

  if (VERBOSE) {
    Isaac.DebugString(
      `MC_POST_GAME_STARTED - ${startSeedString} - on set seed: ${onSetSeed()}`,
    );
  }

  if (!validateRun(continued)) {
    return;
  }

  if (seedIndex >= 0) {
    const player = Isaac.GetPlayer();
    player.UseActiveItem(CollectibleType.COLLECTIBLE_DECK_OF_CARDS);
    const card = player.GetCard(PocketItemSlot.SLOT_1);
    const cardName = getCardName(card);
    Isaac.DebugString(`Card: ${cardName}`);

    if (card === Card.CARD_CHAOS) {
      Isaac.DebugString(`GETTING HERE - CHAOS CARD FOUND - ${startSeedString}`);
    }
  }

  restartOnNextFrame = true;
}

function validateRun(continued: boolean) {
  const game = Game();
  const challenge = Isaac.GetChallenge();
  const player = Isaac.GetPlayer();
  const character = player.GetPlayerType();

  if (continued) {
    error(`The ${MOD_NAME} mod will not work when continuing a run.`);
  }

  if (game.Difficulty !== Difficulty.DIFFICULTY_NORMAL) {
    error(`The ${MOD_NAME} mod will not work on non-normal difficulties.`);
  }

  if (challenge !== Challenge.CHALLENGE_NULL) {
    error(`The ${MOD_NAME} mod will not work on challenges.`);
  }

  if (character !== PlayerType.PLAYER_EDEN) {
    error(`The ${MOD_NAME} mod will not work on characters other than Eden.`);
  }

  return true;
}
