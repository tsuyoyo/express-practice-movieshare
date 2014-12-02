/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.rating;

import mcshare.simple.tasks.rating.Rating;
import android.content.Context;

class RatingViewInflator {

	private Context mContext;

	RatingViewInflator(Context context) {
		mContext = context;
	}

	RatingViewBase getRatingView(Rating rating) {

		RatingViewBase ratingView = null;

		switch (rating.type) {
		case FIVESTAR:
			ratingView = new FiveStarRating(mContext, rating);
			break;
		case RADIO_BUTTON:
			ratingView = new RadioButtonRating(mContext, rating);
			break;
		case SELECTOR:
			ratingView = new SelectorRating(mContext, rating);
			break;
		case TEXT:
			ratingView = new TextRating(mContext, rating);
			break;
		}

		return ratingView;
	}

}
