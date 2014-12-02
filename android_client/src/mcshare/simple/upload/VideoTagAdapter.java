package mcshare.simple.upload;

import java.util.List;

import mcshare.simple.tasks.tag.VideoTag;
import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

public class VideoTagAdapter extends BaseAdapter {

	private List<VideoTag> mTags;

	private Context mContext;
	
    public VideoTagAdapter(Context context) {
    	mContext = context;
    }
    
    public void setData(List<VideoTag> VideoTags) {
    	mTags = VideoTags;
    }
    
    public void addData(VideoTag VideoTag) {
    	if (null != mTags) {
    		mTags.add(VideoTag);
    	}
    }
	
	@Override
	public int getCount() {
		return (null != mTags) ? mTags.size() : 0;
	}

	@Override
	public Object getItem(int position) {
		if (null != mTags && position < mTags.size()) {
			return mTags.get(position);
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
		tv.setText(mTags.get(position).name);
		return tv;
	}

}
