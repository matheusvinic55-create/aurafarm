import type { SaveData } from './schema';
import { MEADOW } from '../domain/maps/meadow';
import { meadowNavigation } from '../domain/maps/navigation';
/** Update coordinates only. Inventory, level, energy and other saved progress survive. */
export function normalizeWorld(data:SaveData):SaveData{
 if(data.player.worldRevision>MEADOW.revision)throw new Error('WORLD_VERSION_UNSUPPORTED');
 const oldMap=data.player.mapId!==MEADOW.id||data.player.worldRevision<MEADOW.revision;
 data.player.position=meadowNavigation().safePosition(oldMap?MEADOW.spawn:data.player.position);
 data.player.mapId=MEADOW.id;data.player.worldRevision=MEADOW.revision;
 data.maps[MEADOW.id]??={unlockedAreas:['clearing'],visitedPlaces:[]};
 return data;
}
