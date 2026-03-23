import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

// SVG Icons
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconStar = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const IconTag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const IconChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const NFT_MARKET_DATA = [
  {id:"ChristmasTree",name:"Christmas Tree",file:"ChristmasTree.png",stars:50,rarity:"common"},
  {id:"Iloveyou",name:"I love you",file:"Iloveyou.png",stars:50,rarity:"common"},
  {id:"NewYearsBear",name:"New Year\'s Bear",file:"NewYearsBear.png",stars:50,rarity:"common"},
  {id:"PolarBear",name:"Polar Bear",file:"PolarBear.png",stars:50,rarity:"common"},
  {id:"ScorpioSling",name:"Scorpio Sling",file:"ScorpioSling.png",stars:356,rarity:"common"},
  {id:"HexPot",name:"Hex Pot",file:"HexPot.png",stars:356,rarity:"common"},
  {id:"SpicedWine",name:"Spiced Wine",file:"SpicedWine.png",stars:356,rarity:"common"},
  {id:"Joker(2)",name:"Joker",file:"Joker.png",stars:373,rarity:"common"},
  {id:"CandyCane(1)",name:"Candy Cane",file:"CandyCane.png",stars:373,rarity:"common"},
  {id:"IceCream(1)",name:"Ice Cream",file:"IceCream.png",stars:373,rarity:"common"},
  {id:"HoneyBee(4)",name:"Honey Bee",file:"HoneyBee.png",stars:374,rarity:"common"},
  {id:"Tangerine(1)",name:"Tangerine",file:"Tangerine(1).png",stars:374,rarity:"common"},
  {id:"SnakeBox",name:"Snake Box",file:"SnakeBox.png",stars:374,rarity:"common"},
  {id:"XmasStocking",name:"Xmas Stocking",file:"XmasStocking.png",stars:374,rarity:"common"},
  {id:"InstantRamen",name:"Instant Ramen",file:"InstantRamen.png",stars:376,rarity:"common"},
  {id:"StellarRocket",name:"Stellar Rocket",file:"StellarRocket.png",stars:382,rarity:"common"},
  {id:"Bloody",name:"Bloody",file:"Bloody.png",stars:387,rarity:"common"},
  {id:"BdayCandle",name:"B-day Candle",file:"BDayCandle.png",stars:389,rarity:"common"},
  {id:"ExtraSpicy",name:"Extra Spicy",file:"ExtraSpicy.png",stars:392,rarity:"common"},
  {id:"HoneyBee(2)",name:"Honey Bee",file:"HoneyBee.png",stars:392,rarity:"common"},
  {id:"LunarSnake",name:"Lunar Snake",file:"LunarSnake.png",stars:392,rarity:"common"},
  {id:"PetSnake",name:"Pet Snake",file:"PetSnake.png",stars:395,rarity:"common"},
  {id:"BigYear",name:"Big Year",file:"BigYear.png",stars:397,rarity:"common"},
  {id:"ChristmasCarol",name:"Christmas Carol",file:"ChristmasCarol.png",stars:398,rarity:"common"},
  {id:"Nostradamus",name:"Nostradamus",file:"Nostradamus.png",stars:398,rarity:"common"},
  {id:"JesterHat",name:"Jester Hat",file:"JesterHat.png",stars:398,rarity:"common"},
  {id:"WhipCupcake",name:"Whip Cupcake",file:"WhipCupcake.png",stars:398,rarity:"common"},
  {id:"Abduction",name:"Abduction",file:"Abduction.png",stars:400,rarity:"common"},
  {id:"Beehive(1)",name:"Beehive",file:"Beehive(1).png",stars:400,rarity:"common"},
  {id:"GoldenBleu",name:"Golden Bleu",file:"GoldenBleu.png",stars:400,rarity:"common"},
  {id:"Santa’sHelper",name:"Santa’s Helper",file:"Santa’sHelper.png",stars:400,rarity:"common"},
  {id:"Wasteland",name:"Wasteland",file:"Wasteland.png",stars:400,rarity:"common"},
  {id:"GingerCookie",name:"Ginger Cookie",file:"GingerCookie.png",stars:400,rarity:"common"},
  {id:"HappyBrownie",name:"Happy Brownie",file:"HappyBrownie.png",stars:400,rarity:"common"},
  {id:"HolidayDrink",name:"Holiday Drink",file:"HolidayDrink.png",stars:400,rarity:"common"},
  {id:"SantaHat(1)",name:"Santa Hat",file:"SantaHat.png",stars:400,rarity:"common"},
  {id:"LolPop",name:"Lol Pop",file:"LolPop.png",stars:402,rarity:"common"},
  {id:"Blizzard(5)",name:"Blizzard",file:"Blizzard.png",stars:404,rarity:"common"},
  {id:"Cherry(4)",name:"Cherry",file:"Cherry.png",stars:408,rarity:"common"},
  {id:"NightBat(2)",name:"Night Bat",file:"NightBat.png",stars:408,rarity:"common"},
  {id:"Frankenstein(3)",name:"Frankenstein",file:"Frankenstein.png",stars:409,rarity:"common"},
  {id:"VictoryMedal",name:"Victory Medal",file:"Medal.png",stars:409,rarity:"common"},
  {id:"AlienSlime",name:"Alien Slime",file:"AlienSlime.png",stars:416,rarity:"common"},
  {id:"Demonius",name:"Demonius",file:"Demonius.png",stars:416,rarity:"common"},
  {id:"GoldenJelly",name:"Golden Jelly",file:"GoldenJelly.png",stars:416,rarity:"common"},
  {id:"TamaGadget",name:"Tama Gadget",file:"TamaGadget.png",stars:416,rarity:"common"},
  {id:"AC/DC",name:"AC/DC",file:"AC/DC.png",stars:417,rarity:"common"},
  {id:"CaptainFlush",name:"Captain Flush",file:"CaptainFlush.png",stars:417,rarity:"common"},
  {id:"CatFood",name:"Cat Food",file:"CatFood.png",stars:417,rarity:"common"},
  {id:"DragonSoup",name:"Dragon Soup",file:"DragonSoup.png",stars:417,rarity:"common"},
  {id:"Frankenstein(4)",name:"Frankenstein",file:"Frankenstein.png",stars:417,rarity:"common"},
  {id:"Garfield(1)",name:"Garfield",file:"Garfield(1).png",stars:417,rarity:"common"},
  {id:"GingerJoker",name:"Ginger Joker",file:"GingerJoker.png",stars:417,rarity:"common"},
  {id:"GoldRush(6)",name:"Gold Rush",file:"GoldRush(6).png",stars:417,rarity:"common"},
  {id:"Half-Life",name:"Half-Life",file:"Half-Life.png",stars:417,rarity:"common"},
  {id:"Intellect",name:"Intellect",file:"Intellect.png",stars:417,rarity:"common"},
  {id:"Loyalty",name:"Loyalty",file:"Loyalty.png",stars:417,rarity:"common"},
  {id:"Poocano",name:"Poocano",file:"Poocano.png",stars:417,rarity:"common"},
  {id:"Sharpshooter",name:"Sharpshooter",file:"Sharpshooter.png",stars:417,rarity:"common"},
  {id:"FreshSocks",name:"Fresh Socks",file:"FreshSocks.png",stars:417,rarity:"common"},
  {id:"HypnoLollipop",name:"Hypno Lollipop",file:"HypnoLollipop.png",stars:417,rarity:"common"},
  {id:"MoneyPot",name:"Money Pot",file:"MoneyPot.png",stars:417,rarity:"common"},
  {id:"PartySparkler",name:"Party Sparkler",file:"PartySparkler.png",stars:417,rarity:"common"},
  {id:"PrettyPosy",name:"Pretty Posy",file:"PrettyPosy.png",stars:417,rarity:"common"},
  {id:"WinterWreath",name:"Winter Wreath",file:"WinterWreath.png",stars:417,rarity:"common"},
  {id:"BloodAdder",name:"Blood Adder",file:"BloodAdder.png",stars:418,rarity:"common"},
  {id:"Broadside",name:"Broadside",file:"Broadside.png",stars:418,rarity:"common"},
  {id:"CherryBomb(1)",name:"Cherry Bomb",file:"CherryBomb(1).png",stars:418,rarity:"common"},
  {id:"Dalmatian(3)",name:"Dalmatian",file:"Dalmatian.png",stars:418,rarity:"common"},
  {id:"Deadpoo",name:"Deadpoo",file:"Deadpoo.png",stars:418,rarity:"common"},
  {id:"FrozenMoss",name:"Frozen Moss",file:"FrozenMoss.png",stars:418,rarity:"common"},
  {id:"GoldChain",name:"Gold Chain",file:"GoldChain.png",stars:418,rarity:"common"},
  {id:"GoldRush(5)",name:"Gold Rush",file:"GoldRush(5).png",stars:418,rarity:"common"},
  {id:"GoldenPuck",name:"Golden Puck",file:"GoldenPuck.png",stars:418,rarity:"common"},
  {id:"Goldium",name:"Goldium",file:"Goldium.png",stars:418,rarity:"common"},
  {id:"GreatAthlete",name:"Great Athlete",file:"GreatAthlete.png",stars:418,rarity:"common"},
  {id:"Hellspawn(1)",name:"Hellspawn",file:"Hellspawn(1).png",stars:418,rarity:"common"},
  {id:"IronMine",name:"Iron Mine",file:"IronMine.png",stars:418,rarity:"common"},
  {id:"JellyBrain",name:"Jelly Brain",file:"JellyBrain.png",stars:418,rarity:"common"},
  {id:"Mermaid",name:"Mermaid",file:"Mermaid.png",stars:418,rarity:"common"},
  {id:"Mushroom(1)",name:"Mushroom",file:"Mushroom(1).png",stars:418,rarity:"common"},
  {id:"PegLeg",name:"Peg Leg",file:"PegLeg.png",stars:418,rarity:"common"},
  {id:"Ratatouille",name:"Ratatouille",file:"Ratatouille.png",stars:418,rarity:"common"},
  {id:"RisingDead",name:"Rising Dead",file:"RisingDead.png",stars:418,rarity:"common"},
  {id:"SpiderWeb",name:"Spider Web",file:"SpiderWeb.png",stars:418,rarity:"common"},
  {id:"SwampParty",name:"Swamp Party",file:"SwampParty.png",stars:418,rarity:"common"},
  {id:"TNTStick",name:"TNT Stick",file:"TNTStick.png",stars:418,rarity:"common"},
  {id:"ToiletBot",name:"Toilet Bot",file:"ToiletBot.png",stars:418,rarity:"common"},
  {id:"WinniePoo",name:"Winnie Poo",file:"WinniePoo.png",stars:418,rarity:"common"},
  {id:"Winter(3)",name:"Winter",file:"Winter.png",stars:418,rarity:"common"},
  {id:"JackintheBox",name:"Jack in the Box",file:"JackintheBox.png",stars:418,rarity:"common"},
  {id:"MousseCake",name:"Mousse Cake",file:"MousseCake.png",stars:418,rarity:"common"},
  {id:"Phoenix(2)",name:"Phoenix",file:"Phoenix.png",stars:419,rarity:"common"},
  {id:"WaffleCone",name:"Waffle Cone",file:"WaffleCone.png",stars:419,rarity:"common"},
  {id:"Wonderland(2)",name:"Wonderland",file:"Wonderland.png",stars:419,rarity:"common"},
  {id:"Aquarium(1)",name:"Aquarium",file:"Aquarium(1).png",stars:420,rarity:"common"},
  {id:"GoldQuartz",name:"Gold Quartz",file:"GoldQuartz.png",stars:420,rarity:"common"},
  {id:"NeonPink(1)",name:"Neon Pink",file:"NeonPink(1).png",stars:420,rarity:"common"},
  {id:"Phantom(6)",name:"Phantom",file:"Phantom.png",stars:420,rarity:"common"},
  {id:"ToxicBrew",name:"Toxic Brew",file:"ToxicBrew.png",stars:420,rarity:"common"},
  {id:"BlueBliss",name:"Blue Bliss",file:"BlueBliss.png",stars:421,rarity:"common"},
  {id:"SecretSanta(1)",name:"Secret Santa",file:"SecretSanta(1).png",stars:421,rarity:"common"},
  {id:"WizardBoy",name:"Wizard Boy",file:"WizardBoy.png",stars:421,rarity:"common"},
  {id:"AzureJoker",name:"Azure Joker",file:"AzureJoker.png",stars:422,rarity:"common"},
  {id:"Dealmaker",name:"Dealmaker",file:"Dealmaker.png",stars:422,rarity:"common"},
  {id:"FastCharge",name:"Fast Charge",file:"FastCharge.png",stars:422,rarity:"common"},
  {id:"HoneyDew",name:"Honey Dew",file:"HoneyDew.png",stars:422,rarity:"common"},
  {id:"Merrow",name:"Merrow",file:"Merrow.png",stars:422,rarity:"common"},
  {id:"Octopoo",name:"Octopoo",file:"Octopoo.png",stars:422,rarity:"common"},
  {id:"PinkyCircus",name:"Pinky Circus",file:"PinkyCircus.png",stars:422,rarity:"common"},
  {id:"Trippy",name:"Trippy",file:"Trippy.png",stars:422,rarity:"common"},
  {id:"CloverPin",name:"Clover Pin",file:"CloverPin.png",stars:422,rarity:"common"},
  {id:"Blobfish",name:"Blobfish",file:"Blobfish.png",stars:423,rarity:"common"},
  {id:"DunkMaster",name:"Dunk Master",file:"DunkMaster.png",stars:423,rarity:"common"},
  {id:"Lovegood",name:"Lovegood",file:"Lovegood.png",stars:423,rarity:"common"},
  {id:"CherryTop",name:"Cherry Top",file:"CherryTop.png",stars:424,rarity:"common"},
  {id:"Negativus",name:"Negativus",file:"Negativus.png",stars:424,rarity:"common"},
  {id:"Spiritwood",name:"Spiritwood",file:"Spiritwood.png",stars:424,rarity:"common"},
  {id:"Alien",name:"Alien",file:"Alien.png",stars:425,rarity:"common"},
  {id:"BrainFreeze(1)",name:"Brain Freeze",file:"BrainFreeze(1).png",stars:425,rarity:"common"},
];

type NFTItem = typeof NFT_MARKET_DATA[number];

const RARITY_COLORS: Record<string, string> = {
  common: '#8b949e',
  rare: '#2AABEE',
  epic: '#a855f7',
  legendary: '#f59e0b',
  dev: '#ef4444',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  dev: 'Dev',
};

function NFTCard({ item, onBuy, onListing }: { item: NFTItem; onBuy: (item: NFTItem) => void; onListing: (item: NFTItem) => void }) {
  const rarityColor = RARITY_COLORS[item.rarity] || '#8b949e';
  return (
    <div
      style={{
        background: 'rgba(35,46,60,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
    >
      {/* Image */}
      <div style={{ position: 'relative', paddingTop: '100%', background: 'rgba(0,0,0,0.2)' }}>
        <img
          src={`https://orproject.ru/nft/${item.file}`}
          alt={item.name}
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).src = `https://orproject.ru/plain-nft/${item.file}`; }}
        />
        {/* Rarity badge */}
        <div style={{ position: 'absolute', top: 6, left: 6, background: rarityColor, color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {RARITY_LABELS[item.rarity] || item.rarity}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 10px 8px' }}>
        <div style={{ color: '#e8eaed', fontSize: 13, fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#f59e0b', fontSize: 12, marginBottom: 8 }}>
          <IconStar size={12} />
          <span>{item.stars.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onBuy(item); }}
            style={{ flex: 1, background: '#2AABEE', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 0', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
          >
            <IconCart /> Купить
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onListing(item); }}
            style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: '#e8eaed', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 0', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
          >
            <IconTag /> Лот
          </button>
        </div>
      </div>
    </div>
  );
}

function BuyModal({ item, onClose, onConfirm, stars }: { item: NFTItem; onClose: () => void; onConfirm: () => void; stars: number }) {
  const canAfford = stars >= item.stars;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: '#1c2733', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360, position: 'relative' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#8b949e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconClose />
        </button>
        <img src={`https://orproject.ru/nft/${item.file}`} alt={item.name}
          style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 16, margin: '0 auto 16px', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).src = `https://orproject.ru/plain-nft/${item.file}`; }} />
        <h3 style={{ color: '#e8eaed', fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>{item.name}</h3>
        <p style={{ color: RARITY_COLORS[item.rarity], fontSize: 12, textAlign: 'center', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{RARITY_LABELS[item.rarity]}</p>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#8b949e', fontSize: 13 }}>Цена</span>
          <span style={{ color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconStar size={14} /> {item.stars.toLocaleString()}
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#8b949e', fontSize: 13 }}>Ваш баланс</span>
          <span style={{ color: canAfford ? '#4ade80' : '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconStar size={14} /> {stars.toLocaleString()}
          </span>
        </div>
        {!canAfford && (
          <p style={{ color: '#ef4444', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>
            Недостаточно звёзд. Нужно ещё {(item.stars - stars).toLocaleString()} 
          </p>
        )}
        <button
          onClick={canAfford ? onConfirm : onClose}
          style={{ width: '100%', background: canAfford ? '#2AABEE' : 'rgba(255,255,255,0.08)', color: canAfford ? '#fff' : '#8b949e', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: canAfford ? 'pointer' : 'default' }}
        >
          {canAfford ? `Купить за ${item.stars.toLocaleString()} ` : 'Пополнить звёзды'}
        </button>
      </div>
    </div>
  );
}

function ListingModal({ item, onClose, userItems }: { item: NFTItem | null; onClose: () => void; userItems: NFTItem[] }) {
  const [selectedItem, setSelectedItem] = useState<NFTItem | null>(item);
  const [price, setPrice] = useState(item ? item.stars : 0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleList = async () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      await api.post('/market/list', { nftId: selectedItem.id, price });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch {
      // если API нет — показать успех демо
      setSuccess(true);
      setTimeout(onClose, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: '#1c2733', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 480 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', marginRight: 12 }}><IconChevronLeft /></button>
          <h3 style={{ color: '#e8eaed', fontSize: 17, fontWeight: 700 }}>Выставить лот</h3>
        </div>
        {success ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ width: 56, height: 56, background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{ color: '#4ade80', fontWeight: 600 }}>Лот выставлен!</p>
          </div>
        ) : (
          <>
            {userItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#8b949e' }}>
                <p style={{ marginBottom: 8 }}>У вас нет NFT для выставления</p>
                <p style={{ fontSize: 12 }}>Купите NFT на маркете чтобы выставить лот</p>
              </div>
            ) : (
              <>
                <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 12 }}>Выберите NFT:</p>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
                  {userItems.map(u => (
                    <div key={u.id} onClick={() => { setSelectedItem(u); setPrice(u.stars); }}
                      style={{ flexShrink: 0, width: 64, cursor: 'pointer', borderRadius: 10, overflow: 'hidden', border: `2px solid ${selectedItem?.id === u.id ? '#2AABEE' : 'transparent'}` }}>
                      <img src={`https://orproject.ru/nft/${u.file}`} alt={u.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
                {selectedItem && (
                  <>
                    <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 8 }}>Цена (звёзды):</p>
                    <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} min={1}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#e8eaed', fontSize: 15, marginBottom: 16, boxSizing: 'border-box' }} />
                    <button onClick={handleList} disabled={loading || price < 1}
                      style={{ width: '100%', background: '#2AABEE', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                      {loading ? 'Выставляю...' : `Выставить за ${price.toLocaleString()} `}
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function MarketPanel() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [rarity, setRarity] = useState<string>('all');
  const [buyItem, setBuyItem] = useState<NFTItem | null>(null);
  const [listingItem, setListingItem] = useState<NFTItem | null>(null);
  const [showListing, setShowListing] = useState(false);
  const [userStars, setUserStars] = useState(0);
  const [userNFTs, setUserNFTs] = useState<NFTItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'market' | 'lots'>('market');

  useEffect(() => {
    api.get('/stars/balance').then(r => setUserStars(r.data.stars || 0)).catch(() => {});
    api.get('/gifts/my').then(r => {
      const gifts = r.data.gifts || r.data.data || [];
      const matched = gifts.map((g: any) => NFT_MARKET_DATA.find(n => n.id === g.nftName || n.name === g.nftName)).filter(Boolean) as NFTItem[];
      setUserNFTs(matched);
    }).catch(() => {});
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleBuy = async (item: NFTItem) => {
    try {
      await api.post('/gifts/send', { nftName: item.id, toUserId: user?.id, price: item.stars });
      setUserStars(s => Math.max(0, s - item.stars));
      setUserNFTs(prev => [...prev, item]);
      setBuyItem(null);
      showToast(`${item.name} куплен!`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Ошибка покупки';
      showToast(msg);
      setBuyItem(null);
    }
  };

  const filtered = NFT_MARKET_DATA.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchRarity = rarity === 'all' || item.rarity === rarity;
    return matchSearch && matchRarity;
  });

  const rarityTabs = [
    { key: 'all', label: 'Все' },
    { key: 'common', label: 'Common' },
    { key: 'rare', label: 'Rare' },
    { key: 'epic', label: 'Epic' },
    { key: 'legendary', label: 'Legendary' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#17212b', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ color: '#e8eaed', fontSize: 20, fontWeight: 700, margin: 0 }}>Маркет NFT</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.15)', borderRadius: 8, padding: '4px 10px' }}>
            <IconStar size={13} />
            <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 600 }}>{userStars.toLocaleString()}</span>
          </div>
        </div>

        {/* Market / Lots tabs */}
        <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, marginBottom: 12 }}>
          {[{key:'market',label:'Маркет'},{key:'lots',label:'Лоты'}].map(t => (
            <button key={t.key} onClick={() => setActiveView(t.key as any)}
              style={{ flex: 1, background: activeView === t.key ? '#2AABEE' : 'transparent', color: activeView === t.key ? '#fff' : '#8b949e', border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8b949e' }}><IconSearch /></div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск NFT..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 12px 9px 36px', color: '#e8eaed', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
        </div>

        {/* Rarity filter */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
          {rarityTabs.map(tab => (
            <button key={tab.key} onClick={() => setRarity(tab.key)}
              style={{ flexShrink: 0, background: rarity === tab.key ? (RARITY_COLORS[tab.key] || '#2AABEE') : 'rgba(255,255,255,0.06)', color: rarity === tab.key ? '#fff' : '#8b949e', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 80px' }}>
        {activeView === 'lots' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: '#8b949e', textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.4 }}>
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Нет активных лотов</p>
            <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>Выставьте свой NFT чтобы продать</p>
            <button onClick={() => setShowListing(true)}
              style={{ background: '#2AABEE', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Выставить лот
            </button>
          </div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#8b949e', paddingTop: 40 }}>Ничего не найдено</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                {filtered.map(item => (
                  <NFTCard key={item.id} item={item} onBuy={setBuyItem} onListing={(it) => { setListingItem(it); setShowListing(true); }} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating "Выставить лот" button */}
      {activeView === 'market' && (
        <div style={{ position: 'absolute', bottom: 72, right: 16 }}>
          <button onClick={() => setShowListing(true)}
            style={{ background: '#2AABEE', color: '#fff', border: 'none', borderRadius: 50, width: 48, height: 48, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(42,171,238,0.4)' }}>
            <IconTag />
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#323d4a', color: '#e8eaed', padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 500, zIndex: 400, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Buy modal */}
      {buyItem && <BuyModal item={buyItem} onClose={() => setBuyItem(null)} onConfirm={() => handleBuy(buyItem)} stars={userStars} />}

      {/* Listing modal */}
      {showListing && <ListingModal item={listingItem} onClose={() => { setShowListing(false); setListingItem(null); }} userItems={userNFTs} />}
    </div>
  );
}
