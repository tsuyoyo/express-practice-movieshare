/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.rating;

import mcshare.simple.tasks.rating.Rating;

import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.util.Log;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.RadioGroup.OnCheckedChangeListener;

public class RadioButtonRating extends RatingViewBase {

	private RadioButton[] mRadioButtons;

	protected RadioButtonRating(Context context, Rating rating) {
		super(context, rating);
	}

	@Override
	public JSONObject getRating() throws JSONException {
		JSONObject res = createBaseResult();

		for (int i = 0; i < mRadioButtons.length; i++) {
			if (mRadioButtons[i].isChecked()) {
				String var = mRating.optionsTag[i];
				res.put("rating", var);
			}
		}
		return res;
	}

	@Override
	public View inflate() {

		LinearLayout layout = inflateBase();

		RadioGroup radioGroup = new RadioGroup(mContext);

		String[] options = strsCurrentLang(mRating.optionsJp, mRating.optionsEn);

		mRadioButtons = new RadioButton[options.length];
		for (int i = 0; i < options.length; i++) {

			String option = options[i];
			String idSeed =  mRating.index + option;

			RadioButton radioButton = new RadioButton(mContext);

			radioButton.setId(idSeed.hashCode());
			radioButton.setText(option);

			if (0 == i) {
				radioButton.setChecked(true);
			}

			radioGroup.addView(radioButton);

			mRadioButtons[i] = radioButton;
		}

		layout.addView(radioGroup);
		radioGroup.setOnCheckedChangeListener(new OnCheckedChangeListener() {
			
			@Override
			public void onCheckedChanged(RadioGroup arg0, int arg1) {
				// TODO Auto-generated method stub
				Log.d("Debug", "checked - " + arg1);
			}
		});

		return layout;
	}

}
