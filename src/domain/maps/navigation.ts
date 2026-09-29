import { NavigationGrid } from '../../engine/navigation/NavigationGrid';
import { MEADOW } from './meadow';
let grid:NavigationGrid|undefined;
export const meadowNavigation=()=>grid??=new NavigationGrid(MEADOW);
