const PROMPTS = {
  reviewReply({ storeName, tone, rating, reviewText }) {
    return `당신은 '${storeName}'의 전문 고객 응대 AI입니다. 고객이 작성한 리뷰에 대해 고품질의 한국어 답글 3가지 버전(정중한 버전, 친근한 버전, 짧은 버전)을 작성해주세요.\n\n[고객 리뷰 정보]\n- 평점: ${rating}\n- 리뷰 내용: ${reviewText}\n- 톤앤매너: ${tone}\n\n[요청 사항]\n1. 정중한 버전: 브랜드의 신뢰감을 높이는 격식 있고 예의 바른 말투\n2. 친근한 버전: 부드러운 어조를 사용하여 고객과 친밀감을 형성하는 말투\n3. 짧은 버전: 핵심만 간결하고 명확하게 전달하는 요약형 말투\n각 버전을 명확히 구분하여 출력해주세요.`;
  },
  productDesc({ productName, features, target, price }) {
    return `당신은 전문 마케팅 카피라이터입니다. 아래 상품 정보를 바탕으로 구매 전환율을 높이는 매력적인 한국어 상품 상세 설명 마케팅 카피를 작성해주세요.\n\n[상품 정보]\n- 상품명: ${productName}\n- 주요 특징: ${features}\n- 타겟 고객: ${target}\n- 가격: ${price}\n\n[요청 사항]\n반드시 아래의 섹션들을 포함하여 작성해주세요:\n1. 헤드라인 (고객의 시선을 사로잡는 캐치프레이즈)\n2. 본문 (상품의 가치, 특징, 혜택을 설득력 있게 전달하는 상세 설명)\n3. 10대 SEO 키워드 (검색 노출을 위한 핵심 검색 키워드 10개)`;
  },
  blogPost({ keyword, topic, storeName }) {
    return `당신은 전문 SEO 블로그 마케터입니다. '${storeName}'을(를) 홍보하기 위해 검색엔진 최적화(SEO)에 최적화된 고품질의 한국어 블로그 포스팅 초안을 작성해주세요.\n\n[블로그 정보]\n- 메인 키워드: ${keyword}\n- 주제: ${topic}\n- 스토어명: ${storeName}\n\n[요청 사항]\n반드시 아래의 구성을 포함하여 작성해주세요:\n1. 블로그 제목 후보 5개 (독자의 클릭을 유도하는 매력적인 제목)\n2. 본문 (키워드가 자연스럽게 녹아들며 정보성과 가독성이 높은 마케팅 본문)\n3. 해시태그 (관련성 높은 해시태그 목록)`;
  },
  instaCaption({ topic, mood, storeName }) {
    return `당신은 트렌디한 인스타그램 마케팅 전문가입니다. '${storeName}'의 피드에 어울리는 감각적이고 매력적인 한국어 인스타그램 캡션을 작성해주세요.\n\n[포스팅 정보]\n- 주제: ${topic}\n- 분위기/무드: ${mood}\n- 스토어명: ${storeName}\n\n[요청 사항]\n1. 인스타그램 본문 캡션 (이모지 및 줄바꿈 활용)\n2. 도달률과 노출을 극대화할 수 있는 관련 해시태그 정확히 20개`;
  }
};

module.exports = PROMPTS;
module.exports.PROMPTS = PROMPTS;
