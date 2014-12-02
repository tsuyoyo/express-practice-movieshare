package mcshare.simple.signin;

import java.util.List;

import mcshare.simple.tasks.user.User;
import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

public class UserSpinnerAdapter extends BaseAdapter {

	private List<User> mUsers;

	private Context mContext;
	
    public UserSpinnerAdapter(Context context) {
    	mContext = context;
    }
    
    public void setData(List<User> users) {
    	mUsers = users;
    }
    
    public void addData(User user) {
    	if (null != mUsers) {
    		mUsers.add(user);
    	}
    }
	
	@Override
	public int getCount() {
		return (null != mUsers) ? mUsers.size() : 0;
	}

	@Override
	public Object getItem(int position) {
		if (null != mUsers && position < mUsers.size()) {
			return mUsers.get(position);
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
		tv.setText(mUsers.get(position).name);
		return tv;
	}


}
