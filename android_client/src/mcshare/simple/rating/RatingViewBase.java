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
import android.widget.TextView;

public abstract class RatingViewBase {

	abstract public JSONObject getRating() throws JSONException;

	abstract public View inflate();

	protected Context mContext;

	protected Rating mRating;

	protected RatingViewBase(Context context, Rating rating) {
		mContext = context;
		mRating = rating;
	}

	protected String strCurrentLang(String jp, String en) {
		return jp;
	}

	protected String[] strsCurrentLang(String[] jp, String[] en) {
		return jp;
	}

	protected LinearLayout inflateBase() {
		LinearLayout layout = new LinearLayout(mContext);
		layout.setLayoutParams(new LinearLayout.LayoutParams(
				LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
		layout.setOrientation(LinearLayout.VERTICAL);

		TextView title = new TextView(mContext);

		String titleStr = "Q" + (mRating.index + 1) + ":"
				+ strCurrentLang(mRating.questionJp, mRating.questionEn);

		title.setText(titleStr);
		title.setLayoutParams(new LinearLayout.LayoutParams(
				LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));

		layout.addView(title);

		return layout;
	}

	protected JSONObject createBaseResult() throws JSONException {
		JSONObject res = new JSONObject();
		res.put("tag", mRating.tag);
		return res;
	}
}
