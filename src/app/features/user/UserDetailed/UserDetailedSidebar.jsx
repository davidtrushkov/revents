import React from 'react';
import { Grid, Segment, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const UserDetailedSidebar = ({ isCurrentUser, profile, followUser, isFollowing, unfollowUser }) => {
  return (
    <Grid.Column width={4}>
        <Segment>
            { isCurrentUser && (
            <Button as={ Link } to='/settings' color='teal' fluid basic content='Edit Profile'/>
            )}

            {/* Check to see if not current user and the current user is NOT following them */}
            {!isCurrentUser && !isFollowing && 
            <Button onClick={ () => followUser(profile) } color='teal' fluid basic content='Follow User'/>
            }

            {!isCurrentUser && isFollowing && 
            <Button onClick={ () => unfollowUser(profile) } color='teal' fluid basic content='Unfollow'/>
            }
            
        </Segment>
    </Grid.Column>
  );
};

export default UserDetailedSidebar;
