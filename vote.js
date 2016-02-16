Members = new Mongo.Collection('members');
Polls = new Mongo.Collection('votes');

Router.configure({
  layoutTemplate: 'main',
});

Router.route('/', {
  name: 'home',
  template: 'home'
});

Router.route('/division');
Router.route('/mprecords');
Router.route('/about');

if (Meteor.isClient) {
  Template.home.tableMembers = function () {
    return Members;
  };

  Template.home.tableMembersSettings = function () {
    return {
      rowsPerPage: 10,
      showFilter: true,
      showNavigation: 'auto',
      fields: [
        { key: 'name', label: 'Name'},
        { key: 'party', label: 'Party'},
        { key: 'activity', label: 'Activity'},
        { key: 'seat', label: 'Seat'},
        { key: 'created', label: 'Created'}
      ],
      useFontAwesome: false,
      showRowCount: true,
      multiColumnSort: false,
      group: 'client',
      rowClass: function(item) {
        var qwe = item.party;
        //
        switch (qwe) {
          case 'Conservative':
            return 'info';
          case 'Green':
            return 'success';
          case 'Labour':
            return 'danger';
          case 'Liberal':
            return 'warning';
          case 'Socialist':
            return 'socialist';
          case 'UKIP':
            return 'ukip';
          default:
            return '';
        }
      },
    };
  };

  Template.polls.table = function () {
    // return Polls.find({"aye.users": "Life_peer"});
    return Polls.find();
  };

  Template.polls.tableSettings = function () {
    return {
      rowsPerPage: 10,
      showFilter: true,
      showNavigation: 'auto',
      fields: [
        { key: 'status', label: 'Status', cellClass: 'center', fn: function (value, object) {
          if (moment(object.end) > moment()) {
            return new Spacebars.SafeString('<span class="label ac label-info">Active</span>');
          } else if (object.aye.num > object.no.num) {
            return new Spacebars.SafeString('<span class="label bc label-success">Passed</span>');
          } else {
            return new Spacebars.SafeString('<span class="label cc label-danger">Failed</span>');
          }}
        },
        { key: 'code', label: 'Code', cellClass: 'poll-right', fn: function (value, object) {return new Spacebars.SafeString('<a href="http://thestudentroom.co.uk/' + object.location + '">' + value + '</a>');}, sortByValue: true },
        { key: 'name', label: 'Name' },
        { key: 'end', label: 'Closed', sortOrder: 1, sortDirection: 'descending', fn: function (value, object) { return moment(value).fromNow(); }, sortByValue: true },
        { key: 'aye.num', label: 'Aye'},
        { key: 'no.num', label: 'No'},
        { key: 'abstain.num', label: 'Abstain'},
        { key: 'totals.3', label: 'Total'}
      ],
      useFontAwesome: false,
      showRowCount: true,
      multiColumnSort: false,
      group: 'client',
      rowClass: function(item) {
        var qnt = item.anomaly;
        //
        if (qnt) {
          return 'warning';
        }
      },
    };
  };

  Template.division.helpers({
    showPoll: function() {
      return Session.get('showPoll');
    },
    showAnomaly: function() {
      return Session.get('item').anomaly;
    }
  });

  Template.polls.events({
    'click .reactive-table tbody tr': function (event) {
      // var name = this.name;
      Session.set('item', this);
      Session.set('showPoll', true);
    }
  });

  Template.ayetemp.helpers({
    category: function(){
      try {
        return Members.findOne({"name": this.toString()}).party;
      } catch (e) {
        return 'nonmp';
      }
    }
  });

  Template.poll.helpers({
    code: function() {
      return Session.get('item').code
    },
    name: function() {
      return Session.get('item').name
    },
    closed: function() {
      return Session.get('item').end
    },
    ayeN: function() {
      return Session.get('item').aye.num * 2
    },
    noN: function() {
      return Session.get('item').no.num * 2
    },
    abstainN: function() {
      return Session.get('item').abstain.num * 2
    },
    aye: function() {
      return Session.get('item').aye.users
    },
    no: function() {
      return Session.get('item').no.users
    },
    abstain: function() {
      return Session.get('item').abstain.users
    },
    ayeFoot: function() {
      return Session.get('item').aye.users.length + ' original | ' + Session.get('item').aye.num + ' final'
    },
    noFoot: function() {
      return Session.get('item').no.users.length + ' original | ' + Session.get('item').no.num + ' final'
    },
    abstainFoot: function() {
      return Session.get('item').abstain.users.length + ' original | ' + Session.get('item').abstain.num + ' final'
    },
    passed: function() {
      var passed = Session.get('item').aye.num > Session.get('item').no.num
      if (moment(Session.get('item').end) > moment()) {
        return 'info'
      } else if (passed) {
        return 'success';
      } else {
        return 'danger';
      };
    },
  });

  Template.registerHelper('formatDate', function(date) {
  return moment(date).fromNow();
  });

  Accounts.config({
    forbidClientAccountCreation: true
  });

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });

  accountsUIBootstrap3.map('en', {
    loginButtonsLoggedOutDropdown: {
      signIn: "Sign in",
      up: "up"
    }
  });

  Template.home.events({
    // 'click .reactive-table tbody tr': function (event) {
    //   Members.remove(this._id);
    // }
    'click .reactive-table tbody tr': function (event) {
      // var name = this.name;
      Session.set('member', this);
      Session.set('showMember', true);
    }
  });

  Template.home.helpers({
    showMember: function() {
      return Session.get('showMember');
    }
  });

  Template.updateMP.helpers({
    name: function() {
      return Session.get('member').name;
    },
    party: function() {
      return Session.get('member').party;
    },
    created: function() {
      return Session.get('member').created;
    }
  });

  Template.updateMP.events({
    'submit .updateMP': function(event) {
      var name = event.target.name.value;
      var party = event.target.party.value;

      Members.insert({
        name: name,
        party: party,
        created: new Date()
      });
      event.target.name.value = "";
      event.target.party.value = "";
    },
  });

  Template.addMP.events({
    'submit .addMP': function(event) {
      var name = event.target.name.value;
      var party = event.target.party.value;

      Members.insert({
        name: name,
        party: party,
        created: new Date()
      });
      event.target.name.value = "";
      event.target.party.value = "";
    },
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
