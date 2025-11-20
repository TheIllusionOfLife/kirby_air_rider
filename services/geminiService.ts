import { GoogleGenAI } from "@google/genai";
import { RacerType } from '../types';
import { RACER_NAMES_JP } from '../constants';

const apiKey = process.env.API_KEY || ''; 

export const getRaceCommentary = async (
  winner: RacerType,
  playerRacer: RacerType,
  playerRank: number
): Promise<string> => {
  if (!apiKey) {
    return "解説システムへの接続が確立できません。";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const winnerName = RACER_NAMES_JP[winner];
    const playerName = RACER_NAMES_JP[playerRacer];

    const prompt = `
      ゲーム「ドリームスター・レーサーズ」のレースが終了しました。
      
      詳細:
      - 優勝者: ${winnerName}
      - プレイヤーのキャラクター: ${playerName}
      - プレイヤーの順位: ${playerRank}位
      
      あなたは日本の熱血アニメのレース実況者です。
      レース結果に対して、日本語で、興奮気味に2文程度の短いコメントをしてください。
      
      もしプレイヤーが勝ったら、盛大に祝福してください。
      もしプレイヤーが負けたら（特にデデデ大王が勝った場合）、面白おかしく煽るか、次への励ましをしてください。
      「ワープスター」や「グルメレース」などのカービィ用語を適宜使ってください。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "すごいレースでしたね！";
  } catch (error) {
    console.error("Error fetching commentary:", error);
    return "実況席からの通信が途絶えました！でも素晴らしいレースでした！";
  }
};

export const getRacerTip = async (racer: RacerType): Promise<string> => {
    if (!apiKey) return "ドリフトを極めて加速しよう！";

    try {
        const ai = new GoogleGenAI({ apiKey });
        const racerName = RACER_NAMES_JP[racer];
        const prompt = `
            カートレースゲームで「${racerName}」を使うプレイヤーに、日本語で一言アドバイスをください。
            アニメのキャラクターになりきって話してください。
            ${racer === RacerType.KIRBY ? 'バランス重視で、誰とでも仲良く走るコツ。' : ''}
            ${racer === RacerType.META_KNIGHT ? 'スピード重視、クールに決めるコツ。' : ''}
            ${racer === RacerType.DEDEDE ? '重量級、邪魔なやつを吹き飛ばすコツ。' : ''}
            30文字以内の短いゲームのヒントにしてください。
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "SPACEキーでドリフトだ！";
    } catch (e) {
        return "ドリフトを使いこなして勝利をつかめ！";
    }
}