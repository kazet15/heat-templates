'use strict';

import Component from './component';
import Network from './network';
import Subnetwork from './subnetwork';
import FloatingIP from './floating-ip';

const Port = function (properties) {
  if (!(this instanceof Port)) {
    return new Port(properties);
  }

  Component.call(this, {
    securityGroups: [],
    ...properties
  });
};

Port.prototype = Object.create(Component.prototype);
Port.prototype.constructor = Port;

Port.prototype.attachFloatingIP = function (floatingIP) {
  if (floatingIP instanceof FloatingIP) {
    floatingIP.properties.port = this;
    this.dependencies.push(floatingIP);
  }
  return this;
};

Port.prototype.getSchema = function () {
  return {
    network: {
      type: [String, Network],
      required: true
    },
    subnetwork: {
      type: [String, Subnetwork],
      required: true
    },
    securityGroups: {
      type: Array,
      items: String
    }
  };
};

Port.prototype.getResources = function () {
  const {id, network, subnetwork, securityGroups} = this.properties;

  const properties = {
    network,
    fixed_ips: [{subnet: subnetwork}]
  };

  Object.assign(
    properties,
    securityGroups.length ? {security_groups: securityGroups} : {}
  );

  return {
    [id]: {
      type: 'OS::Neutron::Port',
      properties
    }
  };
};

export default Port;
