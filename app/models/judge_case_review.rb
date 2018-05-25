class JudgeCaseReview < ApplicationRecord
  enum title: {
    omo_request: "omo_request",
    draft_decision: "draft_decision"
  }
end
