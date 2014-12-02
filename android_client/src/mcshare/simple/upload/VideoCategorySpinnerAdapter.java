/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.upload;

import java.util.List;

import mcshare.simple.tasks.category.VideoCategory;
import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

public class VideoCategorySpinnerAdapter extends BaseAdapter {

	private List<VideoCategory> mCategories;

	private Context mContext;

	public VideoCategorySpinnerAdapter(Context context) {
		mContext = context;
	}

	public void setCategories(List<VideoCategory> categories) {
		mCategories = categories;
	}
	
	@Override
	public int getCount() {
		return (null != mCategories) ? mCategories.size() : 0;
	}

	@Override
	public Object getItem(int position) {
		if (null != mCategories && position < mCategories.size()) {
			return mCategories.get(position);
		} else {
			return null;
		}
	}

	@Override
	public long getItemId(int position) {
		return 0;
	}

	@Override
	public View getView(int position, View convertView, ViewGroup parent) {
		TextView tv = new TextView(mContext);
		if (position < mCategories.size()) {
			tv.setText(mCategories.get(position).name);
			return tv;			
		}
		return null;
	}

}
