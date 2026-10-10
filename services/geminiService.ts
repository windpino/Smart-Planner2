
import { GoogleGenAI } from "@google/genai";
import { Order } from "../types";

export const getSmartLoadingAdvice = async (orders: Order[]): Promise<string> => {
  // Use recommended initialization pattern
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const orderSummary = orders.map(o => 
    `거래처: ${o.clientName}, 품목: ${o.items.map(i => i.name).join(', ')}`
  ).join('\n');

  const prompt = `
    다음은 오늘 예정된 거래처별 주문 및 상차 목록입니다:
    ${orderSummary}

    이 목록을 바탕으로 효율적인 차량 상차 순서나 주의사항을 3문장 이내로 짧고 전문적으로 조언해주세요. 
    예: "부피가 큰 XX물산 품목을 안쪽에 먼저 배치하세요."
    한국어로 답변하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "데이터를 분석 중입니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 분석을 불러올 수 없습니다.";
  }
};
