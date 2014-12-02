/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple;

import mcshare.simple.common.CommonConsts;
import mcshare.simple.upload.VideoUploadFragment;
import mcshare.simple.upload.VideoUploadSimpleFragmentBase;
import android.content.Context;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentStatePagerAdapter;

public class MainPagerAdapter extends FragmentStatePagerAdapter {

    private final String mVideoPath;
    
    private final Context mContext;
	
    public MainPagerAdapter(FragmentManager fm, String videoPath, Context context) {
      super(fm);
      mVideoPath = videoPath;
      mContext = context;
    }

    private static final int FRAGMENT_NUM = CommonConsts.IS_ADMIN_MODE ? 1 : 1;
    
    @Override
    public Fragment getItem(int i) {
    	Fragment fragment;
    	switch(i) {
    	case 0:
    	default:
    		if (CommonConsts.IS_SPECIFIC_PURPOSE) {
        		fragment = VideoUploadSimpleFragmentBase.getInstance(mVideoPath, mContext);    			
    		} else {
        		fragment = VideoUploadFragment.getInstance(mVideoPath, mContext);    			
    		}
    		break;
    	}
    	return fragment;
    }

    @Override
    public int getCount() {
      return FRAGMENT_NUM;
    }

    @Override
    public CharSequence getPageTitle(int position) {
    	String fragmentName;
    	switch(position) {
    	case 0:
    		fragmentName = "Upload";
    		break;
    	case 1:
    	    fragmentName = "Host";
    	    break;
    	case 2:
    		fragmentName = "Users";
    		break;
    	case 3:
    	default:
    		fragmentName = "Category";
    		break;
    	}    	
    	return fragmentName;
    }

}
