export enum EIncomeTypeSourceName {
  SALARY = 'SALARY', // lương chính
  BONUS = 'BONUS', // thưởng (Tết, hiệu suất...)
  FREELANCE = 'FREELANCE', // dự án ngoài / tự do
  BUSINESS = 'BUSINESS', // kinh doanh / bán hàng
  INVESTMENT = 'INVESTMENT', // lãi từ đầu tư (cổ phiếu, crypto...)
  LOAN_RETURN = 'LOAN_RETURN', // người khác trả nợ
  GIFT = 'GIFT', // được cho / tặng tiền
  RENTAL = 'RENTAL', // cho thuê nhà, tài sản
  SCHOLARSHIP = 'SCHOLARSHIP', // học bổng
  OTHER = 'OTHER' // khác (user tự đặt tên)
}

export enum EErrorIncome {
  CANNOT_FIND_USER = 'CANNOT_FIND_USER',
  INVALID_INCOME_ID = 'INVALID_INCOME_ID',
  CANNOT_FIND_INCOME = 'CANNOT_FIND_INCOME',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_SOURCE_NAME = 'INVALID_SOURCE_NAME'
}

export enum EErrorDetail {
  CANNOT_FIND_USER = 'CANNOT_FIND_USER',
  INVALID_INCOME_ID = 'INVALID_INCOME_ID',
  CANNOT_FIND_INCOME = 'CANNOT_FIND_INCOME',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_SOURCE_NAME = 'INVALID_SOURCE_NAME'
}
