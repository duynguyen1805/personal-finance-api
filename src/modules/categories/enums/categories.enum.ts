export enum ECategoriesType {
  ESSENTIAL_NEED = 'ESSENTIAL_NEED',
  PERSONAL_WANTS = 'PERSONAL_WANTS',
  SAVING_AND_INVESTMENT = 'SAVING_AND_INVESTMENT',
  FAMILY_AND_GIVING = 'FAMILY_AND_GIVING',
  OTHER = 'OTHER'
}

const defaultCategories = [
  {
    typeCategory: ECategoriesType.ESSENTIAL_NEED,
    categoryName: [
      'Ăn ở nhà',
      'Ăn ngoài',
      'Đi lại (xăng xe, xe buýt, Grab)',
      'Thuê nhà',
      'Điện nước',
      'Internet',
      'Y tế & thuốc men',
      'Học phí / Khóa học bắt buộc',
      'Phí sinh hoạt (rác, điện thoại...)'
    ]
  },
  {
    typeCategory: ECategoriesType.PERSONAL_WANTS,
    categoryName: [
      'Giải trí (phim, Netflix, game)',
      'Mua sắm cá nhân (quần áo, mỹ phẩm...)',
      'Du lịch / Dã ngoại',
      'Đồ công nghệ (tai nghe, phụ kiện...)',
      'Cafe / Ăn chơi với bạn bè'
    ]
  },
  {
    typeCategory: ECategoriesType.SAVING_AND_INVESTMENT,
    categoryName: [
      'Gửi tiết kiệm',
      'Đầu tư (cổ phiếu, crypto...)',
      'Dự phòng khẩn cấp',
      'Quỹ hưu trí / nghỉ hưu'
    ]
  },
  {
    typeCategory: ECategoriesType.FAMILY_AND_GIVING,
    categoryName: [
      'Hỗ trợ người thân',
      'Quà tặng / Mừng cưới / Sinh nhật',
      'Từ thiện'
    ]
  },
  {
    typeCategory: ECategoriesType.OTHER,
    categoryName: [] // cho phép user tự thêm
  }
];

export enum EErrorCategories {
  INVALID_USER_ID = 'INVALID_USER_ID',
  INVALID_CATEGORY_ID = 'INVALID_CATEGORY_ID',
  CANNOT_FIND_USER = 'CANNOT_FIND_USER',
  CANNOT_FIND_CATEGORY = 'CANNOT_FIND_CATEGORY'
}

export enum EErrorDetail {
  INVALID_USER_ID = 'INVALID_USER_ID',
  INVALID_CATEGORY_ID = 'INVALID_CATEGORY_ID',
  CANNOT_FIND_USER = 'CANNOT_FIND_USER',
  CANNOT_FIND_CATEGORY = 'CANNOT_FIND_CATEGORY'
}
