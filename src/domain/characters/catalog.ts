export interface CharacterDefinition {id:string;name:string;role:string;mapId:string;position:{x:number;y:number};lines:string[]}
export const CHARACTERS:CharacterDefinition[]=[
{id:'lia',name:'Lia',role:'Jardineira',mapId:'meadow',position:{x:1030,y:1370},lines:['Você chegou numa boa hora. A clareira estava precisando de passos novos.','Não precisa correr. Uma horta cresce melhor quando a gente aprende o tempo dela.','Tem dias em que cuidar de uma única semente já é aventura suficiente.']},
{id:'bento',name:'Bento',role:'Guardião das trilhas',mapId:'meadow',position:{x:1320,y:930},lines:['Eu conheço os caminhos daqui pelo barulho das folhas.','A trilha das samambaias ficou fechada por tempo demais. Quando quiser, a gente abre aos poucos.','Nem todo caminho precisa levar a algum lugar importante. Às vezes caminhar já basta.']},
{id:'nina',name:'Nina',role:'Cozinheira',mapId:'meadow',position:{x:780,y:1510},lines:['Se sentir cheiro de pão, pode chegar. Aqui ninguém precisa de convite.','A cozinha é pequena, mas cabe uma tarde inteira dentro dela.','Guarda umas amoras na mochila. Conselho de quem já voltou de trilha com fome.']}
];
export const characterById=(id:string)=>CHARACTERS.find(c=>c.id===id);
export function dialogueFor(id:string,friendship:number){const c=characterById(id);return c?.lines[Math.min(c.lines.length-1,Math.floor(friendship/2))]??''}
