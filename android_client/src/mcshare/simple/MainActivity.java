/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple;

import mcshare.simple.common.CommonConsts;
import mcshare.test.R;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.support.v4.view.ViewPager;
import android.view.Menu;
import android.widget.Toast;

public class MainActivity extends FragmentActivity {

	public static final String EXTRA_USER_ID = "extra_user_id";
	
	public static final String EXTRA_USER_NAME = "extra_user_name";
	
	
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Parse content ID which should be passed.
        if (null == getIntent().getExtras()
                || null == getIntent().getExtras().get(Intent.EXTRA_STREAM)) {
            Toast.makeText(this, "No content is specified", Toast.LENGTH_SHORT).show();
            finish();
        } else {
            Uri uri = (Uri) getIntent().getExtras().get(Intent.EXTRA_STREAM);
            ViewPager viewPager = (ViewPager) findViewById(R.id.view_pager);
            viewPager.setAdapter(new MainPagerAdapter(getSupportFragmentManager(), uri.toString(),
                    this));
        }
        
        if (CommonConsts.IS_SPECIFIC_PURPOSE) {
            setTitle(CommonConsts.SPECIFIC_PURPOSE_TITLE);        	
        }
        
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

}
