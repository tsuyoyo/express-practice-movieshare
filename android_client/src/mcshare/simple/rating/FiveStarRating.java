/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.rating;

import mcshare.simple.tasks.rating.Rating;

import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.widget.LinearLayout;
import android.widget.RatingBar;

class FiveStarRating extends RatingViewBase {

	private RatingBar mRatingBar;
	
	protected FiveStarRating(Context context, Rating rating) {
		super(context, rating);
	}

	@Override
	public JSONObject getRating() throws JSONException {
		
		JSONObject res = createBaseResult();
		res.put("rating", mRatingBar.getRating());
		return res;
	}

	@Override
	public View inflate() {
		LinearLayout layout = inflateBase();
		
		mRatingBar = new RatingBar(mContext);
		mRatingBar.setStepSize(1);
		mRatingBar.setRating(0);
		mRatingBar.setNumStars(5);
		mRatingBar.setLayoutParams(new LinearLayout.LayoutParams(
				LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT));
		
		layout.addView(mRatingBar);
		
		return layout;
	}
}
