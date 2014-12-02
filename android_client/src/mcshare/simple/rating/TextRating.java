/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.rating;

import mcshare.simple.tasks.rating.Rating;

import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.text.InputType;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.widget.EditText;
import android.widget.LinearLayout;

public class TextRating extends RatingViewBase {

	private EditText mEditText;
	
	protected TextRating(Context context, Rating rating) {
		super(context, rating);
	}

	@Override
	public JSONObject getRating() throws JSONException {
		JSONObject res = createBaseResult();
		res.put("rating", mEditText.getText().toString());
		return res;
	}

	@Override
	public View inflate() {
		
		LinearLayout layout = inflateBase();
		
		mEditText = new EditText(mContext);
		mEditText.setInputType(InputType.TYPE_TEXT_FLAG_IME_MULTI_LINE);
		mEditText.setLayoutParams(new LinearLayout.LayoutParams(
				LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
		
		layout.addView(mEditText);
		
		return layout;
	}

}
