/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.rating;

import java.util.ArrayList;
import java.util.List;

import mcshare.simple.tasks.rating.Rating;
import mcshare.test.R;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.res.Resources;
import android.util.Log;
import android.view.ViewGroup.LayoutParams;
import android.widget.LinearLayout;
import android.widget.ScrollView;

public class RatingDialog extends AlertDialog {

	public static RatingDialog getInstance(Context context,
			RatingDialog.IListener listener, List<Rating> ratings) {
		return new RatingDialog(context, listener, ratings);
	}

	public interface IListener {
		public void onComplete(JSONObject rating);
	}

	private IListener mListener;

	private ScrollView mRootView;

	private List<RatingViewBase> mRatingViews;

	protected RatingDialog(Context context, RatingDialog.IListener listener,
			List<Rating> ratings) {

		super(context);

		mListener = listener;

		setTitle("動画に関するアンケート");

		setupView(ratings);

		setView(mRootView);

		setOnClickListener();
	}

	private void setupView(List<Rating> ratings) {

		mRootView = new ScrollView(getContext());
		mRootView.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT,
				LayoutParams.MATCH_PARENT));

		LinearLayout layout = new LinearLayout(getContext());
		Resources res = getContext().getResources();
		layout.setPadding(
				(int) res.getDimension(R.dimen.activity_horizontal_margin),
				(int) res.getDimension(R.dimen.activity_vertical_margin),
				(int) res.getDimension(R.dimen.activity_horizontal_margin),
				(int) res.getDimension(R.dimen.activity_vertical_margin));
		layout.setLayoutParams(new LinearLayout.LayoutParams(
				LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
		layout.setOrientation(LinearLayout.VERTICAL);

		RatingViewInflator viewInflator = new RatingViewInflator(getContext());
		mRatingViews = new ArrayList<RatingViewBase>();

		for (Rating rating : ratings) {
			RatingViewBase ratingView = viewInflator.getRatingView(rating);
			layout.addView(ratingView.inflate());
			mRatingViews.add(ratingView);
		}

		mRootView.addView(layout);
	}

	private void setOnClickListener() {
		setButton(AlertDialog.BUTTON_POSITIVE, "OK", new OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {
				JSONObject res = null;
				try {
					res = getResult();
				} catch (JSONException e) {
					Log.e("RatingDialog", "Failed to get result");
				}
				mListener.onComplete(res);
			}
		});
	}

	private JSONObject getResult() throws JSONException {

		JSONObject res = new JSONObject();

		JSONArray ratings = new JSONArray();

		for (RatingViewBase ratingView : mRatingViews) {
			ratings.put(ratingView.getRating());
		}

		res.put("ratings", ratings);

		return res;
	}

}
