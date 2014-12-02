/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.rating;

import java.util.ArrayList;
import java.util.List;

import mcshare.simple.tasks.rating.Rating;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.widget.CheckBox;
import android.widget.LinearLayout;

public class SelectorRating extends RatingViewBase {

	private List<CheckBox> mCheckboxes;

	protected SelectorRating(Context context, Rating rating) {
		super(context, rating);
	}

	@Override
	public JSONObject getRating() throws JSONException {

		JSONObject res = createBaseResult();

		List<String> checked = new ArrayList<String>();
		for (int i=0; i < mCheckboxes.size(); i++) {
			if (mCheckboxes.get(i).isChecked()) {
				checked.add(mRating.optionsTag[i]);
			}
		}
		
		JSONArray rating = new JSONArray();
		for (String item : checked) {
			rating.put(item);
		}
		
		res.put("selectedOptions", rating);

		return res;
	}

	@Override
	public View inflate() {

		LinearLayout layout = inflateBase();

		mCheckboxes = new ArrayList<CheckBox>();

		if (null != mRating.optionsJp && null != mRating.optionsEn) {

			String[] options = strsCurrentLang(mRating.optionsJp,
					mRating.optionsEn);
			for (String option : options) {
				CheckBox checkBox = inflateCheckBox(option);
				mCheckboxes.add(checkBox);
				layout.addView(checkBox);
			}
		}

		return layout;
	}

	private CheckBox inflateCheckBox(String option) {
		CheckBox cb = new CheckBox(mContext);
		cb.setLayoutParams(new LayoutParams(LayoutParams.WRAP_CONTENT,
				LayoutParams.WRAP_CONTENT));
		cb.setText(option);
		return cb;
	}

}
